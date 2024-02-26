**PDF READER LIBRARY**
***

This repo is a JavaScript based PDF Viewer that allows for display of PDFs with embedded V3D Content use Node.js and webpack

More about V3D here 
- https://github.com/vectorgraphics/v3d

To generate PDFs with embedded V3D content, you can use the asymptote vector graphics language:
- https://asymptote.sourceforge.io/


To use it in a website, include the transform.js file as following in your site    
<script defer src= "https://vectorgraphics.github.io/pdfv3dReader/dist/transform.js" > </script>

and link your PDF as a [query string](https://en.wikipedia.org/wiki/Query_string)  as seen below
- "[webpage url here]?pdf=[link to pdf here]">


or if you have multiple query strings, it might look more like this

- "[webpage url here]?query1="catAndDog"&pdf=[link to pdf here]">
***
**NOTE FOR FUTURE DEVELOPMENT**
***
npx webpack build requires manually updating reader.js to fix the generated pdf.worker URL (Do this ONLY if a  new worker is made).



```
module.exports = function Worker_fn() {
    .... //Whatever is in here 
}
```

to 
```
module.exports = function Worker_fn() {
          let script = document.getElementById("workerScript");

          let workerBlob = new Blob([script.innerHTML], { type: "text/javascript" });
          let workerBlobUrl = URL.createObjectURL(workerBlob);
          return new Worker(workerBlobUrl);
}
```
