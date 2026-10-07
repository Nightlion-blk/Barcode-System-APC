export const CODE_TYPES = ['ean13', 'qrcode'] as const;
export type CodeType = (typeof CODE_TYPES)[number];

export interface CodeGenerator {
  readonly type: CodeType;
  createSku(): string;                        // makes a valid SKU for this format
  generateImage(sku: string): Promise<Buffer>; // draws the image
}
//For Pdf
export interface LabelItem {
  productName: string;
  sku: string;
  quantity: number | null;
  barcodeImageBase64: string;
}