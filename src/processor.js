import * as pdfjs from "pdfjs-dist/webpack";
import * as pdfJsDocument from "pdfjs-dist/lib/core/document";
import { Stream } from "pdfjs-dist/lib/core/stream";
import { TextLayerBuilder } from "pdfjs-dist/lib/web/text_layer_builder";

//Changes pdfjs by removing sdtats in xref.js and changed xrefstats in parser.js

let v3dFile;
let scale = 1.5;

export function setScale(newScale) {
  scale = newScale;
}

export function getScale() {
  return scale;
}
function renderV3DFiles(pageNum, PDFDocument, div) {
  let xrefPagesDict = PDFDocument.xref.fetch(PDFDocument.xref.root._map.Pages);
  let page = PDFDocument.xref.fetch(xrefPagesDict._map.Kids[pageNum - 1]);
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

    script.setAttribute("src", "process.js");

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

function renderPages(pdf, pages, coreDocument) {
  let pdfDiv = document.createElement("div");
  pdfDiv.id = "pdfDiv";
  document.body.appendChild(pdfDiv);
  for (let i = 1; i <= pages; i++) {
    let loadPage = pdf.getPage(i);
    loadPage.then(function (page) {
      console.log(page);
      let containerDiv = document.createElement("div");
      containerDiv.className = "container";
      containerDiv.id = `Page ${i} Container`;

      let textLayerDiv = document.createElement("div");
      containerDiv.appendChild(textLayerDiv);

      let mainCanvas = document.createElement("canvas");
      mainCanvas.id = `Page ${i} Canvas`;
      mainCanvas.className = "page";
      containerDiv.appendChild(mainCanvas);
      pdfDiv.appendChild(containerDiv);

      let viewport = page.getViewport({ scale: scale });
      mainCanvas.height = viewport.height;
      mainCanvas.width = viewport.width;

      textLayerDiv.className = "text-layer";

      textLayerDiv.style.height = viewport.height + "px";
      textLayerDiv.style.width = viewport.width + "px";
      textLayerDiv.style.top = mainCanvas.offsetTop;
      textLayerDiv.style.left = mainCanvas.offsetLeft;

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
        renderV3DFiles(i, coreDocument, containerDiv);
      });
      page.getTextContent().then(function (textContent) {
        let textLayer = new TextLayerBuilder({
          textLayerDiv: textLayerDiv,
          pageIndex: i - 1,
          viewport: viewport,
          eventBus: {
            dispatch: function dispatch(a, b) {
              console.log(a, b);
            },
          },
        });

        textLayer.setTextContent(textContent);
        textLayer.render();
      });
    });
  }
}

export function processPDF(arrayBuffer) {
  let pdftask = pdfjs.getDocument(arrayBuffer);

  pdftask.promise.then(function (pdf) {
    let numPages = pdf.numPages;
    let pdfStream = new Stream(arrayBuffer, 0, arrayBuffer.length, null);
    let coreDocument = new pdfJsDocument.PDFDocument(null, pdfStream);

    coreDocument.parseStartXRef();
    coreDocument.parse();

    renderPages(pdf, numPages, coreDocument);
  });
}
