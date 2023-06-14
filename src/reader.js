//This is the script for the pdf viewer
import { b } from "../dist/reader.js";
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
  if (process.getScale() >= 5) {
    return;
  }
  zoom(0.25);
};

let zoomoutbutton = document.getElementById("zoom-out");
zoomoutbutton.onclick = function () {
  if (process.getScale() <= 0.25) {
    return;
  }
  zoom(-0.25);
};

window.onscroll = function () {
  process.visiblePages();
}

let pageNumber = document.getElementById("pageNumber");

pageNumber.addEventListener("keyup", ({ key }) => {
  if (key == "Enter") {
    //Pop into page
    process.gotoPage(+pageNumber.value);
  }

});

let saveButton = document.getElementById("saveButton");

saveButton.onclick = function () {
  dow
}

function zoom(zoomAmount) {
  process.setScale(process.getScale() + zoomAmount);
  pageScale.textContent = process.getScale() * 100;
  document.body.removeChild(document.getElementById("pdfDiv"));
  process.processPDF(pdfContent);
  process.visiblePages();
}

let hamburgerMenuButton = document.getElementById("hamburgerButton");
let hamburgerMenu = document.getElementById("hamburgerMenuDiv");

hamburgerMenu.style.width = "0%";

hamburgerMenuButton.onclick = function () {
  if (hamburgerMenu.style.width != "0%") {
    hamburgerMenu.style.width = "0%";
  }
  else {
    hamburgerMenu.style.width = "max(15%, 200px)";
  }
}

let printButton = document.getElementById("print-button");
printButton.onclick = function () {
  let w = window.open(filename);
  w.print(filename);
}
let outline = process.getOutline();

let optionButtons = document.getElementsByClassName("optionBtn");

for (let i = 0; i < optionButtons.length; i++) {
  //Add the active tag 
  optionButtons.item(i).onclick = function () {
    //Make all buttons inactive
    for (let j = 0; j < optionButtons.length; j++) {
      optionButtons.item(j).classList.remove("active");
    }
    optionButtons.item(i).classList.add("active");
    let content = document.getElementById("hamburgerContent");
    //Cleat the html
    content.innerHTML = "";

    //Handle the specific cases for each button selection
    let button = optionButtons.item(i);
    if (button.textContent == "Outline") {
      for (let j = 0; j < outline.length; j++) {
        let ref = outline[j];
        let refContainer = document.createElement("div");
        let button = document.createElement("button");
        button.innerText = ref.title;
        let viewer = new process.V3DViewer();

        button.onclick = function () {

          viewer.scrollPageIntoView({ pageNumber: ref.pageNumber, destArray: ref.destArray });
        }

        refContainer.style.height = `10%`;
        refContainer.style.width = "100%";
        refContainer.appendChild(button);
        content.appendChild(refContainer);
      }
    }
    else if (button.textContent == "Tools") {
      //TODO, make the tool section in the pdfDisplay thing and just copy the html over
      //Make default viewer link
      /*
      let defaultViewContainer = document.createElement("div");
      defaultViewContainer.style.height = "10%";
      defaultViewContainer.style.width = "100%";
      let defaultViewLink = document.createElement("a");
      defaultViewLink.style.height = "10%";
      defaultViewLink.style.width = "100%";
      defaultViewLink.innerText = "Default Viewer (To be removed)";
      defaultViewLink.href = filename;
      defaultViewContainer.appendChild(defaultViewLink);
      content.appendChild(defaultViewContainer);

      */
      content.innerHTML = `          <div>
     <a> DEFAULT PDF VIEWER </a>
   </div>
   <div>
     <a> DRAW (To be implemented) </a>
   </div>
   <div>
     <a> ANNOTATE (To be implemented) </a>
   </div>`;
    }
  }
} 