//This is the script for the pdf viewer
import * as process from "./processor.js";

let pdfContent;

let currentURL = window.location.href;

let currentstr = currentURL.toString();
let defaultLink = document.getElementById("default-view-link");
let url = new URL(currentURL);
let params = url.searchParams;

let filename = params.get("pdf");
let file = filename.substring(filename.lastIndexOf("/") + 1);
let title = document.createElement("title");
let navbarName = document.getElementById("pdf-name");
navbarName.textContent = title.text = file;
defaultLink.href = filename;
document.head.appendChild(title);

fetch(filename)
  .then((response) => response.arrayBuffer())
  .then(
    function (pdfBuffer) {
      pdfContent = pdfBuffer;
      process.processPDF(pdfBuffer);
    },
    function (error) {
      console.log(new Error(error));
    }
  );

let pageScale = document.getElementById("pageScale");
let zoominbutton = document.getElementById("zoom-in");
zoominbutton.onclick = function () {
  process.setScale(process.getScale() + 0.25);
  pageScale.textContent = process.getScale() * 100;
  document.body.removeChild(document.getElementById("pdfDiv"));
  process.processPDF(pdfContent);
  process.visiblePages();
};

let zoomoutbutton = document.getElementById("zoom-out");
zoomoutbutton.onclick = function () {
  if (process.getScale() <= 0.25) {
    return;
  }
  process.setScale(process.getScale() - 0.25);
  pageScale.textContent = process.getScale() * 100;
  document.body.removeChild(document.getElementById("pdfDiv"));
  process.processPDF(pdfContent);
  process.visiblePages();
};

window.onscroll = function () {
  process.visiblePages();
}