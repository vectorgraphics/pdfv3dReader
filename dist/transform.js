let currentURL = window.location.href;
let url = new URL(currentURL);
let params = url.searchParams;
let filename = params.get("pdf");
console.log(filename);
if (filename != null) {
  if (filename.endsWith(".pdf")) {
    fetch('https://vectorgraphics.github.io/pdfv3dReader/dist/pdf.worker.6e464fc4e89902936cb8.js')
      .then(response => response.text())
      .then((data) => {
        let workerScript = document.createElement("script");
        workerScript.id = "workerScript";
        workerScript.innerHTML = data;

        let readerScript = document.createElement("script");
        readerScript.src = "https://vectorgraphics.github.io/pdfv3dReader/dist/reader.js"
        //readerScript.defer = true;
        readerScript.type = "module";

        document.head.innerHTML = `<meta charset=" UTF-8" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
    <link rel="stylesheet" href="https://vectorgraphics.github.io/pdfv3dReader/dist/overlay.css" />
    `;

        document.head.appendChild(workerScript);
        document.head.appendChild(readerScript);

        document.body.innerHTML = `
        <div id="navbar" class="sticky">
        <div id="left-navbar">
          <div title="Menu" id="HamburgerMenu">
            <svg class="hamburgerLine" height="100%" width="100%">
              <rect
                id="hamburgerButton"
                class="btn"
                x="0"
                y="0"
                rx="10"
                ry="10"
                width="100%"
                height="100%"
              />
              <line x1="25%" y1="25%" x2="75%" y2="25%" />
              <line x1="25%" y1="50%" x2="75%" y2="50%" />
              <line x1="25%" y1="75%" x2="75%" y2="75%" />
            </svg>
          </div>
          <div id="PDFName">
            <a id="pdf-name">LOADING</a>
          </div>
        </div>
        <div id="center-navbar">
          <div id="pageMenu">
            <input title="Page Number" type="text" id="pageNumber" value="0" />
            <a id="divider">/</a>
            <a id="totalPageNumber">0</a>
          </div>
          <div id="menuDivider">
            <svg height="100%" width="100%">
              <line x1="50%" y1="25%" x2="50%" y2="75%" />
            </svg>
          </div>
          <div id="zoom">
            <button title="Zoom out" id="zoom-out">-</button>
            <a id="pageScale"> 150% </a>
            <button title="Zoom in" id="zoom-in">+</button>
          </div>
        </div>
        <div id="right-navbar">

          <div id="save" title= "Save PDF">

          <a download id="default-view-link">
            <svg>


            <rect
            id="saveButton"
            class="btn"
            x="0"
            y="0"
            rx="10"
            ry="10"
            width="100%"
            height="100%"
          />
              <line x1="50%" y1="25%" x2="50%" y2="75%" />
              <line x1="25%" y1="55%" x2="50%" y2="75%" />
              <line x1="75%" y1="55%" x2="50%" y2="75%" />
              <line x1="10%" y1="85%" x2="90%" y2="85%" />


            </svg>
            </a>
          </div>
          <div id="print" title="Print PDF">
            <svg height="100%" width="100%">
              <rect
              id="print-button"
              class="btn"
              x="0"
              y="0"
              rx="10"
              ry="10"
              width="100%"
              height="100%"
            />
              <line x1="25%" y1="85%" x2="75%" y2="85%" />
              <line x1="25%" y1="55%" x2="75%" y2="55%"/>
              <line x1="25%" y1="55%" x2="25%" y2="85%"/>
              <line x1="75%" y1="55%" x2="75%" y2="85%"/>
              <line x1="37.5%" y1="75%" x2="62.5%" y2="75%" />

              <line x1="35%" y1="25%" x2="65%" y2="25%" />
              <line x1="35%" y1="25%" x2="35%" y2="55%" />
              <line x1="65%" y1="25%" x2="65%" y2="55%" />

              <line class="paperLine" x1="40%" y1="35%" x2="60%" y2="35%" />
              <line class="paperLine" x1="40%" y1="40%" x2="60%" y2="40%" />
            </svg>
          </div>
        </div>
      </div>
      <div id="hamburgerMenuDiv">
        <div id="optionsMenu">
          <div id="outlineButton">
            <button class="optionBtn">Outline</button>
          </div>
          <div id="toolsButton">
            <button class="optionBtn active">Tools</button>
          </div>
        </div>
        <div id="hamburgerContent" class="Tools">
          <div>
          <button><a href=${filename}> DEFAULT PDF VIEWER</a> </button>
          </div>
          <div>
            <button id="hamburgerSearch"> <a>Search</a> </button>
          </div>

        </div>
      </div>
      <div id="searchBar" style="height: 0ex;">
        <input id="searchInput" height="100%" width="100%" placeholder="Search...">
        <button id="searchBarButton"> Search </button>
        <div>
        <a id="currentMatchNumber">0</a>
        <a>/</a>
        <a id="totalMatchNumber">0</a>
        </div>
        <button style="font-size: xx-large;" id="upSearch">↑</button>
        <button style="font-size: xx-large;" id="downSearch">↓</button>
        <button id="closeSearchBarButton"> X</button>
      </div>

    `;

      })


  }

}
