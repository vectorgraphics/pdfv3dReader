**PDF READER LIBRARY**
***

This repo is a JavaScript based PDF Viewer that allows for display of pdf's with embedded V3D Content use Node.js and webpack

More about V3D here 
- https://github.com/vectorgraphics/v3d

To generate PDF's with V3D files embedded, you can learn about the asymptote vector graphics language here
- https://asymptote.sourceforge.io/


To use it in a website, include the transform.js file as following in your site    
<script defer src= "https://sean-madu.github.io/PDF_ReaderLib/dist/transform.js" > </script>

and link your pdf as a [query string](https://en.wikipedia.org/wiki/Query_string)  as seen below
- "[webpage url here]?pdf=[link to pdf here]">


or if you have multiple query strings, it might look more like this

- "[webpage url here]?query1="catAndDog"&pdf=[link to pdf here]">
***
**NOTE FOR FUTURE DEVELOPMENT**
***
webpacks worker script is a bit finicky, so we have to use a tedious workaround, in dist/reader.html paste the generated pdf.worker in the workerScript tag (Do this ONLY if new worker is made) then change the reader.js line



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
Finally whenever you edit a file such as the overlay.css or the reader.js, make sure to change it to the apporiate local file name in the transform.js file and other html files in the dist folder then switch back to linking to this repos when you push.

P.S Dont forget the index.html, its useful for testing and it has examples of how it can be used.
Have fun!
