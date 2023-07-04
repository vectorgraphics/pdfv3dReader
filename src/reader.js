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
  if (process.getScale() >= 3) {
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
  let oldScale = process.getScale();
  let newScale = oldScale + zoomAmount;
  let ratio = newScale / oldScale;
  process.setScale(newScale);
  pageScale.textContent = `${newScale * 100}%`;
  let oldDiv = document.getElementById("pdfDiv");
  console.log(ratio);
  console.log(scrollY * ratio);
  process.processPDF(pdfContent, { x: scrollX * ratio, y: scrollY * ratio });
  document.body.removeChild(oldDiv);
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


function makeDropDown(outline, container, dropdown) {

  for (let j = 0; j < outline.length; j++) {
    let ref = outline[j];
    let refContainer = document.createElement("div");
    refContainer.classList.add("refContainer");
    let button = document.createElement("button");
    button.innerText = ref.title;
    let viewer = new process.V3DViewer();

    button.onclick = function () {

      viewer.scrollPageIntoView({ pageNumber: ref.pageNumber, destArray: ref.destArray });
    }

    refContainer.style.height = `10%`;
    if (ref.children.length != 0) {
      refContainer.style.width = "90%";
      let dropdownButton = document.createElement("button");
      dropdownButton.innerHTML = ">";
      dropdownButton.style.height = "100%";
      dropdownButton.style.width = "10%";
      refContainer.appendChild(dropdownButton);
      dropdownButton.onclick = function () {
        if (dropdownButton.classList.contains("active")) {
          //remove dropdown list
          refContainer.nextSibling.remove();
          dropdownButton.classList.remove("active");
        }
        else {
          // add dropdown list
          let dropdownDiv = document.createElement("div");
          dropdownDiv.classList.add("dropdownContainer");
          refContainer.after(dropdownDiv);
          dropdownButton.classList.add("active");
          makeDropDown(ref.children, dropdownDiv, true);
        }
      }
    }
    refContainer.style.width = "100%";
    refContainer.appendChild(button);
    container.appendChild(refContainer);
  }
}


for (let i = 0; i < optionButtons.length; i++) {
  //Add the active tag 
  optionButtons.item(i).onclick = function () {
    //Make all buttons inactive
    for (let j = 0; j < optionButtons.length; j++) {
      optionButtons.item(j).classList.remove("active");
    }
    optionButtons.item(i).classList.add("active");
    let content = document.getElementById("hamburgerContent");
    //Clear the html
    content.innerHTML = "";
    content.classList.remove("dropdownContainer");


    //Handle the specific cases for each button selection
    let button = optionButtons.item(i);
    if (button.textContent == "Outline") {
      makeDropDown(outline, content, false);

    }
    else if (button.textContent == "Tools") {
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

window.onkeydown = function (e) {
  var ck = e.keyCode ? e.keyCode : e.which;
  if (e.ctrlKey && ck == 70) {
    alert('Searching...');
  }
}