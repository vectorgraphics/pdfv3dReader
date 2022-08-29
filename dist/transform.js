

let currentURL = window.location.href;
let currentstr = currentURL.toString();
let filename = decodeURIComponent(currentstr.slice(currentstr.search("=") + 1));
if (filename.endsWith(".pdf")) {
  fetch('https://sean-madu.github.io/PDF_ReaderLib/dist/pdf.worker.02bb9abcaa6f661db926.js')
    .then(response => response.text())
    .then((data) => {
      let workerScript = document.createElement("script");
      workerScript.id = "workerScript";
      workerScript.innerHTML = data;

      let readerScript = document.createElement("script");
      readerScript.src = "https://sean-madu.github.io/PDF_ReaderLib/dist/reader.js"
      readerScript.defer = true;
      readerScript.type = "module";

      document.head.innerHTML = `<meta charset=" UTF-8" />
    <link rel="stylesheet" href="https://sean-madu.github.io/PDF_ReaderLib/dist/overlay.css" />
    `;

      document.head.appendChild(workerScript);
      document.head.appendChild(readerScript);

      document.body.innerHTML = `
      <div id="navbar" class="sticky">
        <div id="left-navbar">
          <a id="pdf-name">LOADING</a>
        </div>
        <div id="zoom">
          <button id="zoom-out">-</button>
          <a id="pageScale"> 150% </a>
          <button id="zoom-in">+</button>
        </div>
        <div id="right-navbar">
          <div id="save">
            <a id="default-view-link" href="">DEFAULT VIEWER</a>
            <button>DEFAULT VIEWER</button>
          </div>
        </div>
      </div>
    `;

    })


}

