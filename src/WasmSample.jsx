import wasmUrl from './pdfium.wasm?url'
import createPdfium from './pdfium'
import { functions } from './functions'

function malloc(size, pdfium) {
  const ptr = pdfium.wasmExports.malloc(size);
  for (let i = 0; i < size; i++) {
    pdfium.HEAP8[ptr + i] = 0;
  }

  return ptr;
}

function free(ptr, pdfium) {
  pdfium.wasmExports.free(ptr);
}

export default function WasmSample() {
  
  const handleInitWasm = async () => {
    const wasmBinary = await fetch(wasmUrl).then(res => res.arrayBuffer())
    const pdfium = await createPdfium({ wasmBinary })
    const mod = {
     pdfium 
    }
    for (const key in functions) {
      const ident = key;
      const args = functions[ident][0];
      const ret = functions[ident][1];
      mod[ident] = pdfium.cwrap(key, ret, args);
    }
    console.log(pdfium)

    mod.PDFium_Init();

    const fileContent = await fetch("/sample.pdf").then((res) => res.arrayBuffer());

    const array = new Uint8Array(fileContent);
    const length = array.length;
    const filePtr = malloc(length, pdfium);
    pdfium.HEAPU8.set(array, filePtr);

    const password = ""
    const passwordBytesSize = new TextEncoder().encode(password).length + 1;
    const passwordPtr = malloc(passwordBytesSize, pdfium);
    pdfium.stringToUTF8(
      password,
      passwordPtr,
      passwordBytesSize,
    );

    const docPtr = mod.FPDF_LoadMemDocument(
      filePtr,
      length,
      passwordPtr,
    );

    free(passwordPtr, pdfium);


    const pageCount = mod.FPDF_GetPageCount(docPtr);
    console.log("pageCount:", pageCount)
  }

  return (
    <div>
      <button onClick={handleInitWasm} className="btn">Init Wasm</button>
    </div>
  );
}
