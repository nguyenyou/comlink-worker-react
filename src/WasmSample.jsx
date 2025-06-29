import wasmUrl from "./pdfium.wasm?url";
import samplePdfUrl from "./sample.pdf?url";
import createPdfium from "./pdfium";
import { functions } from "./functions";

let mod = {}

function malloc(size) {
  const ptr = mod.pdfium.wasmExports.malloc(size);
  for (let i = 0; i < size; i++) {
    mod.pdfium.HEAP8[ptr + i] = 0;
  }

  return ptr;
}

function free(ptr) {
  mod.pdfium.wasmExports.free(ptr);
}

export default function WasmSample() {
  const handleInitWasm = async () => {
    const wasmBinary = await fetch(wasmUrl).then((res) => res.arrayBuffer());
    const pdfium = await createPdfium({ wasmBinary });
    mod.pdfium = pdfium;
    for (const key in functions) {
      const ident = key;
      const args = functions[ident][0];
      const ret = functions[ident][1];
      mod[ident] = pdfium.cwrap(key, ret, args);
    }
    console.log(pdfium);

    mod.PDFium_Init();

    console.log("Init DONE")
  };

  const handleLoadDocument = async () => {
    const fileContent = await fetch(samplePdfUrl).then((res) =>
      res.arrayBuffer()
    );

    const array = new Uint8Array(fileContent);
    const length = array.length;
    const filePtr = malloc(length);
    mod.pdfium.HEAPU8.set(array, filePtr);

    const password = "";
    const passwordBytesSize = new TextEncoder().encode(password).length + 1;
    const passwordPtr = malloc(passwordBytesSize);
    mod.pdfium.stringToUTF8(password, passwordPtr, passwordBytesSize);

    const docPtr = mod.FPDF_LoadMemDocument(filePtr, length, passwordPtr);

    free(passwordPtr);

    const pageCount = mod.FPDF_GetPageCount(docPtr);
    console.log("pageCount:", pageCount);
  };

  return (
    <div>
      <button onClick={handleInitWasm} className="btn">
        Init Wasm
      </button>
      <button onClick={handleLoadDocument} className="btn">
        Load Document
      </button>
    </div>
  );
}
