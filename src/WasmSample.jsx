import * as React from "react";
import wasmUrl from "./pdfium.wasm?url";
import samplePdfUrl from "./sample.pdf?url";
import createPdfium from "./pdfium";
import { functions } from "./functions";

let mod = {};
let docPtr = null;
let firstPage = null;

const RenderFlag = {
  ANNOT: 0x01, // Set if annotations are to be rendered.
  LCD_TEXT: 0x02, // Set if using text rendering optimized for LCD display.
  NO_NATIVETEXT: 0x04, // Don't use the native text output available on some platforms
  GRAYSCALE: 0x08, // Grayscale output.
  DEBUG_INFO: 0x80, // Set if you want to get some debug info. Please discuss with Foxit first if you need to collect debug info.
  NO_CATCH: 0x100, // Set if you don't want to catch exception.
  RENDER_LIMITEDIMAGECACHE: 0x200, // Limit image cache size.
  RENDER_FORCEHALFTONE: 0x400, // Always use halftone for image stretching.
  PRINTING: 0x800, // Render for printing.
  REVERSE_BYTE_ORDER: 0x10, // Set whether render in a reverse Byte order, this flag only.
};

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
  const [pageWidth, setPageWidth] = React.useState(100);
  const [pageHeight, setPageHeight] = React.useState(100);

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

    console.log("Init DONE");
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

    docPtr = mod.FPDF_LoadMemDocument(filePtr, length, passwordPtr);

    free(passwordPtr);

    const pageCount = mod.FPDF_GetPageCount(docPtr);
    console.log("pageCount:", pageCount);
  };

  const handleRenderFirstPage = async () => {
    const format = 4; // BitmapFormat.Bitmap_BGRA;
    const bytesPerPixel = 4;
    const pageCount = mod.FPDF_GetPageCount(docPtr);
    const sizePtr = malloc(8);
    const index = 0;
    mod.FPDF_GetPageSizeByIndexF(docPtr, index, sizePtr);
    const page = {
      index,
      size: {
        width: mod.pdfium.getValue(sizePtr, "float"),
        height: mod.pdfium.getValue(sizePtr + 4, "float"),
      },
    };
    setPageWidth(page.size.width);
    setPageHeight(page.size.height);
    console.log("page:", page);
    const dpr = window.devicePixelRatio;

    const bitmapSize = {
      width: page.size.width * dpr,
      height: page.size.height * dpr,
    };

    const bitmapHeapLength =
      bitmapSize.width * bitmapSize.height * bytesPerPixel;
    const bitmapHeapPtr = malloc(bitmapHeapLength);
    const bitmapPtr = mod.FPDFBitmap_CreateEx(
      bitmapSize.width,
      bitmapSize.height,
      format,
      bitmapHeapPtr,
      bitmapSize.width * bytesPerPixel
    );
    mod.FPDFBitmap_FillRect(
      bitmapPtr,
      0,
      0,
      bitmapSize.width,
      bitmapSize.height,
      0xffffffff
    );
    let flags = RenderFlag.REVERSE_BYTE_ORDER | RenderFlag.ANNOT;
    const pagePtr = mod.FPDF_LoadPage(docPtr, page.index);
    mod.FPDF_RenderPageBitmap(
      bitmapPtr,
      pagePtr,
      0,
      0,
      bitmapSize.width,
      bitmapSize.height,
      0,
      flags
    );
    mod.FPDFBitmap_Destroy(bitmapPtr);
    mod.FPDF_ClosePage(pagePtr);

    const data = mod.pdfium.HEAPU8.subarray(
      bitmapHeapPtr,
      bitmapHeapPtr + bitmapHeapLength
    );
    const imageData = new ImageData(
      new Uint8ClampedArray(data),
      bitmapSize.width,
      bitmapSize.height
    );

    console.log("imageData:", imageData);
    const canvas = document.getElementById("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
  };

  return (
    <div>
      <button onClick={handleInitWasm} className="btn">
        Init Wasm
      </button>
      <button onClick={handleLoadDocument} className="btn">
        Load Document
      </button>
      <button onClick={handleRenderFirstPage} className="btn">
        Render First Page
      </button>
      <div
        style={{
          width: pageWidth,
          height: pageHeight,
        }}
      >
        <canvas id="canvas" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
