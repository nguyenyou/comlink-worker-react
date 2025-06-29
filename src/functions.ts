
export const functions = {
  PDFium_Init: [[], null],
  FPDF_LoadMemDocument: [["number","number","number"], 'number'],
  FPDF_GetPageCount: [["number"], 'number'],
}
