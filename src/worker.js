import * as Comlink from "comlink";
import createPdfium from "./pdfium.js";

const obj = {
  counter: 0,
  doc: null,
  async initPdfium(wasmBinary) {
    const pdfium = await createPdfium({ wasmBinary });
    console.log(pdfium)
  },
  inc() {
    console.log("inc");
    this.counter++;
  },
  pow(a) {
    return a * a;
  },
  sum(a, b) {
    console.log("sum");
    return a + b;
  },
  sumAsync(a, b) {
    console.log("sumAsync");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(a + b);
      }, 1000);
    });
  },
  openDoc(buffer) {
    this.doc = buffer;
    console.log("doc is opened in worker thread 👇");
    console.log(buffer)
  }
};

Comlink.expose(obj);