// This is the pdf processor

import * as pdfjs from "pdfjs-dist/webpack";
import * as pdfJsDocument from "pdfjs-dist/lib/core/document";
import { Stream } from "pdfjs-dist/lib/core/stream";
import { TextLayerBuilder } from "pdfjs-dist/lib/web/text_layer_builder";
import { Ref } from "pdfjs-dist/lib/core/primitives";
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer";
import { AnnotationLayerBuilder } from "pdfjs-dist/web/pdf_viewer";


//Changes pdfjs by removing sdtats in xref.js and changed xrefstats in parser.js

let v3dFile;
let scale = 1.5;
let pdf;
let coreDocument;

export function setScale(newScale) {
  scale = newScale;
}

export function getScale() {
  return scale;
}

function renderV3DFiles(pageRef, PDFDocument, div, pageNum) {
  let ref = new Ref(pageRef.num, pageRef.gen);
  let page = PDFDocument.xref.fetch(ref);
  let annotationRef = page._map.Annots;
  if (!annotationRef) {
    return;
  }
  //Look through Annotations for V3D File
  for (let j = 0; j < annotationRef.length; j++) {
    let annotation = PDFDocument.xref.fetch(annotationRef[j]);
    if (annotation._map.Subtype.name != "RichMedia") {
      continue;
    }

    let mediaContent = PDFDocument.xref.fetch(annotation._map.RichMediaContent);
    let fileName = mediaContent._map.Assets._map.Names[0];
    if (!fileName.endsWith(".v3d") && !fileName.endsWith(".V3D")) {
      continue;
    }
    let fileSpecRef = PDFDocument.xref.fetch(annotation._map.RichMediaContent)
      ._map.Assets._map.Names[1];
    let fileSpec = PDFDocument.xref.fetch(fileSpecRef);

    let fileStreamRef = fileSpec._map.EF._map.F;
    let fileStream = PDFDocument.xref.fetch(fileStreamRef);
    while (!fileStream.eof) {
      fileStream.readBlock();
    }

    let doc = document.implementation.createHTMLDocument();
    let iframe = document.createElement("iframe");
    let script = document.createElement("script");
    let v3dScript = document.createElement("script");
    let asyCanvas = document.createElement("canvas");

    asyCanvas.id = "Asymptote";

    v3dFile = fileStream.buffer.slice(0, fileStream.bufferLength);
    v3dScript.textContent = `let v3dArrayBuffer = [${fileStream.buffer.slice(
      0,
      fileStream.bufferLength
    )}];`;

    script.setAttribute(
      "src",
      "https://sean-madu.github.io/PDF_ReaderLib/dist/process.js"
    );

    let canvas = document.getElementById(`Page ${pageNum} Canvas`);

    let top = canvas.height - scale * annotation._map.Rect[3];
    let right = canvas.width - scale * annotation._map.Rect[2];

    iframe.id = `${fileName} iframe`;
    iframe.className = "file-frame";
    iframe.height = (annotation._map.Rect[3] - annotation._map.Rect[1]) * scale;
    iframe.width = (annotation._map.Rect[2] - annotation._map.Rect[0]) * scale;
    iframe.style.top = top.toString() + "px";
    iframe.style.right = right.toString() + "px";
    iframe.textContent = "Loading or Browser does not support iframes";
    div.appendChild(iframe);

    doc.body.appendChild(asyCanvas);
    doc.body.appendChild(v3dScript);
    doc.body.appendChild(script);
    doc.body.style.overflow = "hidden";

    iframe.srcdoc = doc.documentElement.outerHTML;
  }
}

export function visiblePages() {
  let pages = document.getElementsByClassName("container");
  for (let i = 0; i < pages.length; i++) {
    let container = pages.item(i);
    if (container.offsetTop + container.offsetHeight < window.scrollY ||
      container.offsetTop > window.scrollY + window.outerHeight) {
      if (container.classList.contains("visible")) {
        removePage(i);
      }
    }
    else {
      if (!container.classList.contains("visible")) {
        renderPage(i + 1, container, container.firstChild);
      }
    }
  }
}

function removePage(i) {
  let container = document.getElementById(`Page ${i + 1} Container`);
  container.innerHTML = ``;
  container.classList.remove("visible");
}


function renderPage(i, containerDiv, textLayerDiv) {
  let loadPage = pdf.getPage(i);
  loadPage.then(
    function (page) {
      let mainCanvas = document.createElement("canvas");
      mainCanvas.id = `Page ${i} Canvas`;
      mainCanvas.className = "page";
      containerDiv.appendChild(mainCanvas);

      let viewport = page.getViewport({ scale: scale });
      mainCanvas.height = viewport.height;
      mainCanvas.width = viewport.width;

      let textLayerDiv = document.createElement("div");


      textLayerDiv.style.height = viewport.height + "px";
      textLayerDiv.style.width = viewport.width + "px";
      textLayerDiv.style.top = mainCanvas.offsetTop;
      textLayerDiv.style.left = mainCanvas.offsetLeft;

      textLayerDiv.className = "text-layer";

      containerDiv.appendChild(textLayerDiv);

      containerDiv.style.height = mainCanvas.height.toString() + "px";
      containerDiv.style.width = mainCanvas.width.toString() + "px";



      let context = mainCanvas.getContext("2d");
      let renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      let renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        console.log("Page rendered");
        renderV3DFiles(page.ref, coreDocument, containerDiv, i);
      });
      page.getTextContent().then(function (textContent) {
        let textLayer = new TextLayerBuilder({
          textLayerDiv: textLayerDiv,
          pageIndex: i - 1,
          viewport: viewport,
          eventBus: {
            dispatch: function dispatch(a, b) {
            },
          },
        });

        textLayer.setTextContent(textContent);
        textLayer.render();

      });
    }
  )
  containerDiv.classList.add("visible");
}



function setUpPages(pdf, pages) {
  let pdfDiv = document.createElement("div");
  pdfDiv.id = "pdfDiv";
  document.body.appendChild(pdfDiv);
  for (let i = 1; i <= pages; i++) {
    let loadPage = pdf.getPage(i);
    loadPage.then(function (page) {
      let containerDiv = document.createElement("div");
      containerDiv.className = "container";
      containerDiv.id = `Page ${i} Container`;

      pdfDiv.appendChild(containerDiv);

      let viewport = page.getViewport({ scale: scale });

      containerDiv.style.height = viewport.height + "px";
      containerDiv.style.width = viewport.width + "px";

      visiblePages();
    });
  }
}

export function processPDF(arrayBuffer) {
  let pdftask = pdfjs.getDocument(arrayBuffer);

  pdftask.promise.then(function (_pdf) {
    pdf = _pdf
    let numPages = pdf.numPages;
    let pdfStream = new Stream(arrayBuffer, 0, arrayBuffer.length, null);
    coreDocument = new pdfJsDocument.PDFDocument(null, pdfStream);

    coreDocument.parseStartXRef();
    coreDocument.parse();
    setUpPages(pdf, numPages);
  });
}
