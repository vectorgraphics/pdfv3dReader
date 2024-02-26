**PDF READER LIBRARY**
***

This repo is a JavaScript-based PDF Viewer that allows for display of PDFs with embedded V3D Content, using Node.js and webpack

The specification for the V3D format is here:
- https://github.com/vectorgraphics/v3d

The Asymptote vector graphics language can generate V3D content and optionally embed it within a PDF file:
- https://asymptote.sourceforge.io/

To display a local v3d-enabled PDF file `file.pdf` within an HTML file `index.html`, add to the HTML header (between <HEAD> and </HEAD>):

```
<script defer src= "https://vectorgraphics.github.io/pdfv3dReader/dist/transform.js"></script>
```

and add

```
<iframe src="index.html?pdf=file.pdf" width="1920" height="1080" frameborder="0"></iframe>
```

to the HTML body.

***
**NOTE FOR FUTURE DEVELOPMENT**
***
```npx webpack build``` requires manually changing

```
module.exports = function Worker_fn() {
    .... //Whatever is in here 
}
```

in `reader.js` to
```
module.exports = function Worker_fn() {
          let script = document.getElementById("workerScript");

          let workerBlob = new Blob([script.innerHTML], { type: "text/javascript" });
          let workerBlobUrl = URL.createObjectURL(workerBlob);
          return new Worker(workerBlobUrl);
}
```
