
export const functions = {
  PDFium_Init: [[], null],
  FPDF_LoadMemDocument: [["number","number","number"], 'number'],
  FPDF_GetPageCount: [["number"], 'number'],
  FPDF_GetPageSizeByIndexF: [['number', 'number', 'number'], 'number'],
  FPDFBitmap_CreateEx: [
    ['number', 'number', 'number', 'number', 'number'],
    'number',
  ],
  FPDFBitmap_FillRect: [
    ['number', 'number', 'number', 'number', 'number', 'number'],
    null,
  ],
  FPDF_LoadPage: [['number', 'number'], 'number'],
  FPDF_RenderPageBitmap: [
    [
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
    ],
    null,
  ],
  FPDFBitmap_Destroy: [['number'], null],
  FPDF_ClosePage: [['number'], null],
}
