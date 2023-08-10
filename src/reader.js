//This is the script for the pdf viewer
import * as process from "./processor.js";

let pdfContent;

let currentURL = window.location.href;


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

  if (searching) {
    let pages = [];
    for (let i = 0; i < visiblePages.length; i++) {
      let page = visiblePages.item(i);
      pages.push(page);
    }
    process.visiblePages({ searching: searching, visiblePages: pages });
  } else {
    process.visiblePages();
  }


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




//Custom search function


let searching = false;
let searchBar = document.getElementById("searchBar");
window.onkeydown = function (e) {

  var ck = e.keyCode ? e.keyCode : e.which;
  if (e.ctrlKey && ck == 70) {
    e.preventDefault();

    if (!searching) {
      searchBar.style.height = "10ex";
      searching = true;
    }
    else {
      searching = false;
      searchBar.style.height = "0ex";
    }
  }
}

let visiblePages;

let searchButton = document.getElementById("searchBarButton");
searchButton.onclick = function () {
  removeHighlights();
  visiblePages = document.getElementsByClassName("visible");
  let totalMatches = 0;
  let containers = document.getElementsByClassName("container");
  let totalMatchElement = document.getElementById("totalMatchNumber");

  let currentMatchElement = document.getElementById("currentMatchNumber");
  totalMatchElement.innerText = currentMatchElement.innerText = "0";
  let earliestPage = containers.length;
  let pagesCompared = 0;
  for (let i = 0; i < containers.length; i++) {

    let container = containers.item(i);
    let page = process.getPDFPage(i + 1)
    page.then(
      function (page) {
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
          let matchesArray = pageTextContent.match(word);
          pagesCompared++;
          if (matchesArray != null) {
            totalMatches += matchesArray.length;
            totalMatchElement.innerText = totalMatches;
            if (i < earliestPage) {
              earliestPage = i;
            }
          }
          if (pagesCompared == containers.length) {

            process.gotoPage(earliestPage + 1);
            if (totalMatches != 0) {
              currentMatchElement.innerText = "1";
            }
          }

          //This page is visible do highlights
          if (container.classList.contains("visible")) {
            let match;
            let newPageContent = pageTextContent;
            let uniqueMatches = [];
            while ((match = word.exec(pageTextContent)) !== null) {
              if (!uniqueMatches.includes(match[0])) {
                uniqueMatches.push(match[0]);

                let arr = match[0].split('\u0000'); //each split is a span

                for (let i = 0; i < arr.length; i++) {
                  if (i % 2 == 0) {
                    arr[i] = `<span class="highlighter">` + arr[i] + `</span>`;

                  }
                }

                let newStr = arr.join('\u0000');
                newPageContent = newPageContent.replaceAll(match[0], newStr);
                let content = newPageContent.split('\u0000');
                let filteredContent = content.filter((word) => word != "");
                let spans = document.querySelectorAll("span");
                for (let i = 0; i < spans.length; i++) {
                  let span = spans.item(i);
                  if (!span.innerHTML == "") {
                    span.innerHTML = filteredContent[i];
                  }
                }
              }
            }
          }

        });
      }
    )


  }
}

let closeSearchBarButton = document.getElementById("closeSearchBarButton");
closeSearchBarButton.onclick = function () {
  removeHighlights();
  searching = false;
  searchBar.style.height = "0ex";
}

//re render the texts of all visible pages
function removeHighlights() {
  let highlights = document.getElementsByClassName("highlighter");
  while (highlights.length > 0) {
    let highlight = highlights.item(0);
    highlight.outerHTML = highlight.innerHTML; //removing the highlight but keeping the word
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
            let searchItem = document.getElementById("searchInput").value;
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
                      break;
                    }
                  }
                  console.log(span);
                  span.innerHTML = str.substring(0, searchIndex) + `<span style="background-color: yellow" class="highlighter">` + str.substring(searchIndex, searchIndex + searchItem.length) + "</span>" + str.substring(searchIndex + searchItem.length);
                  if (searchItem.length > str.substring(searchIndex).length) {
                    //Item is not fully contained, so we wrap the whole word
                    //Continue looking through span index for other 
                    let remainder = searchItem.substring(str.substring(searchIndex).length); // get the rest of the word that hasnt been foun yet
                    console.log(remainder);
                    while (remainder.length > 0) {
                      index++;
                      span = spans.item(index);
                      let inner = span.innerHTML;
                      span.innerHTML = `<span style="background-color: yellow" class="highlighter">` + inner.substring(0, remainder.length) + "</span>" + inner.substring(remainder.length);
                      remainder = searchItem.substring(inner.length);
                    }
                  }
                  else {
                    //Item has been fully wrapped, keep looking
                    let remainder = pageTextContent.substring(firstIndex + searchItem.length);
                    let search = remainder.search(word);
                    //word does not appear in this page again
                    if (search < 0) {
                      break;
                    }
                    firstIndex = search + firstIndex + searchItem.length;
                    let newSearchIndex = firstIndex - lengthChecked;
                    console.log(` search = ${search}search inde = ${searchIndex} remainder : ${remainder} firstInde ${firstIndex}`);

                    //word appears in the same object
                    if (newSearchIndex < 0) {
                      index = 0;
                      while (newSearchIndex < 0) {
                        console.log(newSearchIndex);
                        searchIndex = str.substring(0, searchIndex + searchItem.length).length + search; //next occurence of searhItem in word
                        let inner = span.innerHTML;
                        let adjust = (index + 1) * 66; //How many characters we have inserted into the original string
                        span.innerHTML = inner.substring(0, searchIndex + adjust) + `<span style="background-color: yellow" class="highlighter">` + inner.substring(searchIndex + adjust, searchIndex + adjust + searchItem.length) + "</span>" + inner.substring(searchIndex + searchItem.length + adjust);
                        index++;
                        remainder = pageTextContent.substring(firstIndex + searchItem.length);
                        search = remainder.search(word);
                        //word does not appear in this page again
                        if (search < 0) {
                          break;
                        }
                        firstIndex = search + firstIndex + searchItem.length;
                        newSearchIndex = firstIndex - lengthChecked;
                      }
                    }
                    searchIndex = newSearchIndex;
                  }

                }
                else {
                  searchIndex -= str.length;
                }

              }
            }

          })
        }
      )
    }
  }


  */
