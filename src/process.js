import * as v3dconv from "./v3dconv";

function load_asy_gl() {
  return new Promise(function (resolve, reject) {
    let asy_gl = document.createElement("script");
    asy_gl.type = "text/javascript";

    asy_gl.src =
      "https://vectorgraphics.github.io/asymptote/base/webgl/asygl-1.02.js";

    asy_gl.onload = function () {
      resolve();
    };

    asy_gl.onerror = function () {
      reject(new Error("Could not load the asy_gl library"));
    };

    document.head.appendChild(asy_gl);
  });
}

let v3dobj = v3dconv.V3DReader.from_file_arr(v3dArrayBuffer);
let promise = load_asy_gl();

promise.then(function () {
  v3dobj.process();
  webGLStart();
});
