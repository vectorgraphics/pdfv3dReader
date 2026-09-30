**PDF READER LIBRARY**
***

This repo is a JavaScript-based PDF Viewer that allows for display of PDFs with embedded V3D Content, using Node.js and webpack

The specification for the V3D format is here:
- https://github.com/vectorgraphics/v3d

The Asymptote vector graphics language can generate V3D content and optionally embed it within a PDF file:
- https://asymptote.sourceforge.io/

To display a local v3d-enabled PDF file `file.pdf` within an HTML file, add to the HTML header (between `<HEAD>` and `</HEAD>`):

```
<script defer src="https://vectorgraphics.github.io/pdfv3dReader/dist/transform.js"></script>
<style>
  html, body { margin: 0; height: 100%; }
  iframe { display: block; width: 100%; height: 100%; border: 0; }
</style>
```

and add

```
<iframe src="?pdf=file.pdf"></iframe>
```

to the HTML body. The bare `?pdf=file.pdf` query string refers to the current page, so no filename is needed in the iframe `src`.

The iframe is sized responsively (it fills the browser window). The actual PDF page dimensions are read from the file automatically by PDF.js, so there is no need to specify a `width`/`height` matching the document -- pages render at their native size and scroll within the viewer.

***
**BUILDING**
***

To rebuild the dist bundles, run:

```
npm run build
```

This runs webpack and automatically patches the `Worker_fn` in `dist/reader.js` to use the `workerScript` blob injected by `transform.js` (instead of the content-hashed worker file that webpack emits).

---

