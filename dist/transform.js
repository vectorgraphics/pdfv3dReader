let currentURL = window.location.href;
let currentstr = currentURL.toString();
let filename = decodeURIComponent(currentstr.slice(currentstr.search("=") + 1));
if (filename.endsWith(".pdf")) {
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
  document.head.innerHTML = `<meta charset=" UTF-8" />
<link rel="stylesheet" href="https://sean-madu.github.io/PDF_ReaderLib/dist/overlay.css" />
<script
  defer
  type="module"
  src="https://sean-madu.github.io/PDF_ReaderLib/dist/reader.js"
></script>
<script defer type="module" src="./transform.js"></script>`;
}
