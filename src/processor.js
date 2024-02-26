// This is the pdf processor
// TODO  once more than one visibe page it messes up 
// Set minimize to true in webpack config




import * as pdfjs from "pdfjs-dist/webpack";
import * as pdfJsDocument from "pdfjs-dist/lib/core/document";
import { Stream } from "pdfjs-dist/lib/core/stream";
import { TextLayerBuilder } from "pdfjs-dist/lib/web/text_layer_builder";
import { AnnotationLayerBuilder } from "pdfjs-dist/lib/web/annotation_layer_builder";
import { Ref } from "pdfjs-dist/lib/core/primitives";
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer";
import { PDFLinkService } from "pdfjs-dist/lib/web/pdf_link_service";
import { EventBus } from "pdfjs-dist/lib/web/event_utils";


//Changes pdfjs by removing sdtats in xref.js and changed xrefstats in parser.js

//Collection of outlineObjects
let outlineObjects = [];
let pdfMetadata;

export function getPDFPage(i) {
  return pdf.getPage(i);
}

export class V3DViewer {
  currentPageNumber;
  pagesRotation;
  constructor() {

  }

  scrollPageIntoView({ pageNumber, destArray, ignoreDestinationZoom }) {
    if (ignoreDestinationZoom) {
      setScale(1.5);
    }

    let pageContainer = document.getElementById(`Page ${pageNumber} Container`);
    pageContainer.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });

    let xCord = pageContainer.clientWidth - (destArray[2] * scale);
    let yCord = pageContainer.clientHeight - (destArray[3] * scale) - document.getElementById("navbar").clientHeight;
    window.scrollBy({ top: yCord, left: xCord, behavior: "smooth" });
  }
}

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
      "https://vectorgraphics.github.io/pdfv3dReader/dist/process.js"
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

let toScroll = false;
export function visiblePages(searching = { searching: false, pages: [], toScroll: false }) {
  let pages = document.getElementsByClassName("container");
  let minVisPage = pages.length;
  for (let i = 0; i < pages.length; i++) {
    let container = pages.item(i);
    let position = container.getBoundingClientRect();
    //If container out of frame render it, else dont
    if (position.top < window.innerHeight && position.bottom >= 0) {
      if (i + 1 < minVisPage) {
        minVisPage = 1 + i;
      }

      if (!container.classList.contains("visible")) {
        renderPage(i + 1, container, container.firstChild);

      }
    }
    else {
      if (container.classList.contains("visible")) {
        removePage(i);
      }
    }
  }
  let topPage = document.getElementById("pageNumber");
  topPage.value = minVisPage.toString();
  if (searching.searching) {
    let visiblePages = document.getElementsByClassName("visible");
    for (let j = 0; j < visiblePages.length; j++) {
      let visiblePage = visiblePages.item(j);
      if (!visiblePage.classList.contains("highlighted")) {
        let page = getPDFPage(+visiblePage.id.split(" ")[1]);
        page.then(function (page) {
          let content = page.getTextContent();
          content.then(function (c) {
            let pageTextContent = "";
            for (let i = 0; i < c.items.length; i++) {

              pageTextContent += '\u0000' + c.items[i].str + '\u0000';
            }

            let searchItem = document.getElementById("searchInput").value;
            if (searchItem == "") {
              searchItem = " ";
            }
            let regItem = "";
            for (let i = 0; i < searchItem.length; i++) {
              let char = searchItem.charAt(i);
              regItem += `(${char}` + '\u0000' + `+|${char})`; //match the character then any number of flags between it
            }

            let word = new RegExp(regItem, "gi");

            let match;
            let newPageContent = pageTextContent;
            let uniqueMatches = [];
            let matchNumber = 0;
            while ((match = word.exec(pageTextContent)) !== null) {
              if (!uniqueMatches.includes(match[0])) {
                matchNumber++;
                uniqueMatches.push(match[0]);

                let arr = match[0].split('\u0000'); //each split is a span
                let filter = arr.filter((word) => word != "");
                for (let i = 0; i < arr.length; i++) {
                  if (i % 2 == 0) {
                    arr[i] = `<span class="highlighter matchLength${filter.length}" >` + arr[i] + `</span>`;

                  }
                }

                let newStr = arr.join('\u0000');
                newPageContent = newPageContent.replaceAll(match[0], newStr);
                let content = newPageContent.split('\u0000');
                let filteredContent = content.filter((word) => word != "");

                let spans = visiblePage.querySelectorAll("span");
                for (let i = 0; i < spans.length; i++) {
                  let span = spans.item(i);
                  if (!span.innerHTML == "") {
                    span.innerHTML = filteredContent[i];
                  }
                }
              }
            }
            if (searching.pages.at(+visiblePage.id.split(" ")[1] - 1) != null) {
              //There are matches on this page
              //Highlight the appropriate match
              let activeNumber = +document.getElementById("currentMatchNumber").innerText;
              let page = searching.pages.at(+visiblePage.id.split(" ")[1] - 1);

              // Check that page contains match, i.e the active number is between the previous matches and the total matches
              let prev = 0;
              for (let i = 0; i < +visiblePage.id.split(" ")[1] - 1 - 1; i++) {
                if (searching.pages.at(i) != null) {
                  prev += +searching.pages.at(i).numMatches;
                }
              }
              if (activeNumber > prev && activeNumber <= +page.numMatches + prev) {
                let spans = visiblePage.getElementsByClassName("highlighter");
                let span = spans.item(activeNumber - prev - 1);
                let matchLength = +span.classList.item(1).substring(11);

                for (let i = 0; i < matchLength; i++) {
                  spans.item(activeNumber - prev - 1 + i).classList.add("active");
                }

                if (searching.toScroll || toScroll) {
                  span.scrollIntoView({ "behavior": "instant", "block": "center", "inline": "center" });
                  toScroll = false;
                }

              }
            }

          });
        });

        if (searching.toScroll) {

          let activeNumber = +document.getElementById("currentMatchNumber").innerText;
          let prev = 0;
          //find the next page with the active
          for (let i = 1; i < searching.pages.length; i++) {
            if (searching.pages.at(i) != null) {
              if (activeNumber > prev && activeNumber <= +searching.pages.at(i).numMatches + prev) {
                //active is in this page, scroll to this page and scroll to activ
                toScroll = true;
                gotoPage(i + 1);

                break;
              }
              prev += +searching.pages.at(i).numMatches;

            }
          }

        }

        visiblePage.classList.add("highlighted");
      }
    }
  }

}



function removePage(i) {
  let container = document.getElementById(`Page ${i + 1} Container`);
  container.innerHTML = ``;
  container.classList.remove("visible");
  container.classList.remove("highlighted");
}


function getOutlineItem(item) {
  return new Promise(function (resolve, reject) {
    pdf.getDestination(item.dest).then(function (dest) {
      pdf.getPageIndex(dest[0]).then(function (id) {
        let pageNumber = parseInt(id) + 1;
        let title = item.title;
        let destArray = dest;

        let outlineObject = {
          pageNumber: pageNumber, title: title,
          destArray: destArray, children: []
        };

        //recurively get children
        for (let i = 0; i < item.items.length; i++) {
          getOutlineItem(item.items[i]).then(function (obj) {
            outlineObject.children.push(obj);
          });
        }
        resolve(outlineObject);
      });
    });
  })

}

export function renderPage(i, containerDiv, textLayerDiv) {
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

      //TODO look into faking an event bus for internal scrolling
      let eventBus = new EventBus;
      let linkService = new PDFLinkService({ eventBus: eventBus });
      linkService.setDocument(pdf);
      linkService.setViewer(new V3DViewer);
      //TODO look into faking a pdf viewer as well (check the code for link services to see)
      let annotationLayer = new AnnotationLayerBuilder({
        pageDiv: containerDiv,
        pdfPage: page,
        enableScripting: true,
        linkService: linkService
      });


      annotationLayer.render(viewport).then(
        function (data) {
          annotationLayer.div.style.height = viewport.height + "px";
          annotationLayer.div.style.width = viewport.width + "px";
          annotationLayer.div.style.top = mainCanvas.offsetTop;
          annotationLayer.div.style.left = mainCanvas.offsetLeft;
        }
      );

    }
  )
  containerDiv.classList.add("visible");
}

export function gotoPage(i) {

  let pageContainer = document.getElementById(`Page ${i} Container`);
  pageContainer.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });
}

function setUpPages(pdf, pages, zoom) {

  let totalPageNumber = document.getElementById("totalPageNumber");
  let input = document.getElementById("pageNumber");
  input.style.width = `${pages.toString().length}ch`;
  totalPageNumber.textContent = pages;
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

      visiblePages(); //in here because loading pages is async (inneficient see if you can do this faster)
      // Also inneficient
      scrollTo({ top: zoom.y, left: zoom.x, behavior: "instant" });

    });
  }

}

export function getOutline() {
  return outlineObjects;
}
export function getMeta() {
  return pdfMetadata;
}

export function processPDF(arrayBuffer, zoom = {}) {
  let pdftask = pdfjs.getDocument(arrayBuffer);

  pdftask.promise.then(function (_pdf) {
    pdf = _pdf
    let numPages = pdf.numPages;
    let pdfStream = new Stream(arrayBuffer, 0, arrayBuffer.length, null);
    coreDocument = new pdfJsDocument.PDFDocument(null, pdfStream);

    coreDocument.parseStartXRef();
    coreDocument.parse();
    setUpPages(pdf, numPages, zoom);
    pdf.getMetadata().then(function (metadata) {
      pdfMetadata = metadata;
      let pdfTitle = document.getElementById("pdf-name");
      let title = document.createElement("title");
      pdfTitle.textContent = title.text = metadata.info.Title;
      document.head.appendChild(title);
    });
    //Set up outline
    pdf.getOutline().then(function (outline) {
      if (outline) {
        for (let i = 0; i < outline.length; i++) {
          getOutlineItem(outline[i]).then(function (obj) {
            outlineObjects.push(obj);
          });

        }
      }
    });
  });
}



