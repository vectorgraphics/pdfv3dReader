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
let navbarName = document.getElementById("pdf-name");
navbarName.textContent = file;
defaultLink.href = filename;


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
  process.setScale(newScale);
  pageScale.textContent = `${newScale * 100}%`;
  //resize all the pdf pages
  let pages = document.getElementsByClassName("container");
  for (let i = 0; i < pages.length; i++) {
    let page = pages.item(i);
    let oldy = page.clientHeight;
    let oldx = page.clientWidth;

    page.style.height = `${(oldy / oldScale) * newScale}px`;
    page.style.width = `${(oldx / oldScale) * newScale}px`;
    page.classList.remove("visible");
    page.innerHTML = '';
  }
  scrollTo({ top: scrollY, left: scrollX, behavior: "instant" });
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
    content.classList.remove("Tools");


    //Handle the specific cases for each button selection
    let button = optionButtons.item(i);
    if (button.textContent == "Outline") {
      makeDropDown(outline, content, false);

    }
    else if (button.textContent == "Tools") {
      content.classList.add("Tools");
      content.innerHTML = `          <div>
      <a href=${defaultLink}> DEFAULT PDF VIEWER</a>
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


function wrap(searchIndex, string, wordLength) {

}


//Custom search function

window.onkeydown = function (e) {
  var ck = e.keyCode ? e.keyCode : e.which;
  if (e.ctrlKey && ck == 70) {
    let pageNum = +document.getElementById("pageNumber").value;
    let page = process.getPDFPage(pageNum);
    page.then(
      function (page) {
        let content = page.getTextContent();
        content.then(function (c) {
          let pageTextContent = "";
          for (let i = 0; i < c.items.length; i++) {
            pageTextContent += c.items[i].str;
          }
          let searchItem = "dif-fe";
          let regItem = new RegExp(searchItem, "gi");
          let firstIndex = pageTextContent.search(regItem);
          if (firstIndex >= 0) {
            console.log(firstIndex);
            let searchIndex = firstIndex;
            for (let i = 0; i < c.items.length; i++) {
              let str = c.items[i].str;
              //Search item is in the item, either partially or fully
              if (firstIndex < str.length) {

                //Check to see if the whole word is contained in this item
                if (searchItem.length <= str.substring(searchIndexIndex).length) {
                  //whole word is in this item
                  //Wrap the whole thing

                }
                else {
                  //word is not fully in item
                  //wrap till the end, put back into function
                }
              }
              else {
                searchIndex -= str.length;
              }

            }
            //start loop for through c again but skip first one so i starts at 1
            // check to see if index > length
            // If index < length then we know it was in the previous one

            //Make this a recursive function?
            // Check the previous one to see if the whole word is contained, that is if the first 
            // index minus the length is less than the length of what we are looking for
            // wrap the appropriate thing anyway (either the whole length or till the end) in a span with the class so we 
            // know to highlight
            //send the unfinished back to function that will handle the rest of the word being cutoff

            // If there is another match (pgeTextContent being sliced after the total length is returnred which will be returned by the fucntion above)
            // then update first index and continue the loop
            // else just breaks
          }
        })
      }
    )
  }
}

/*
  window.onkeydown = function (e) {
    var ck = e.keyCode ? e.keyCode : e.which;
    if (e.ctrlKey && ck == 70) {
      let pageNum = +document.getElementById("pageNumber").value;
      let page = getPDFPage(pageNum);
      page.then(
        function (page) {
          let content = page.getTextContent();
          content.then(function (c) {
            let pageTextContent = "";
            for (let i = 0; i < c.items.length; i++) {
              pageTextContent += c.items[i].str;
            }
            let searchItem = "d ";
            let word = new RegExp(searchItem, "gi");
            let firstIndex = pageTextContent.search(word);
            let searchIndex = firstIndex;
            console.log(firstIndex);
            if (firstIndex >= 0) {
              let lengthChecked = 0;
              for (let i = 0; i < c.items.length; i++) {

                let str = c.items[i].str;
                lengthChecked = lengthChecked + str.length;
                console.log(lengthChecked);
                //Search item is in the item 
                if (firstIndex < lengthChecked) {
                  //Check to see if the whole word is contained in this item

                  // get the element with the inner html (MOCE THIS OUTSIDE SO WE JUST GET IT ONCE)
                  let container = document.getElementById(`Page ${pageNum} Container`);
                  let textLayer = container.getElementsByClassName("text-layer");
                  let spans = textLayer.item(0).querySelectorAll("span");
                  let span;
                  let index = 0;
                  for (; index < spans.length; index++) {
                    if (spans.item(index).innerHTML == str) {
                      span = spans.item(index);
                    }
                  }
                  console.log(span);
                  span.innerHTML = str.substring(0, searchIndex) + `<span style="background-color: yellow">` + str.substring(searchIndex, searchIndex + searchItem.length) + "</span>" + str.substring(searchIndex + searchItem.length);
                  if (searchItem.length > str.substring(searchIndex).length) {
                    //Item is not fully contained, so we wrap the whole word
                    //Continue looking through span index for other 

                  }
                  else {
                    //Item has been fully wrapped, keep looking
                    let remainder = pageTextContent.substring(firstIndex + searchItem.length);
                    firstIndex = remainder.search(word) + firstIndex + searchItem.length;
                    searchIndex = firstIndex - lengthChecked;
                    console.log(` search inde = ${searchIndex} remainder : ${remainder} firstInde ${firstIndex}`);
                    if (firstIndex < 0) {
                      break;
                    }
                    //checking to see if reapears in the same word again

                  }

                }
                else {
                  searchIndex -= str.length;
                  console.log(`not in word firstIndex = ${firstIndex} lengthChecked = ${lengthChecked}`);
                }

              }
            }

          })
        }
      )
    }
  }
  */
