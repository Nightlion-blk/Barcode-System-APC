// barcoded-items.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateBarcodedItemDto } from '../barcode.dto/barcode.dto.js';
import { BarcodeGeneratorService } from './barcode-generator.service.js';
import { QrGeneratorService } from './qrcode-generator.service.js';
import { CodeGenerator, CodeType, LabelItem } from '../Interface/item.interfact.js';
import { BarcodePdfService } from './barcodePdf.service.js';

@Injectable()
export class BarcodedItemsService {
  private readonly generators: Record<CodeType, CodeGenerator>;

  constructor(
    private readonly prisma: PrismaService,
    barcode: BarcodeGeneratorService,
    qr: QrGeneratorService,
    private readonly printPDF: BarcodePdfService
  ) {
    this.generators = { ean13: barcode, qrcode: qr };
  }

  private getGenerator(type: CodeType): CodeGenerator {
    const gen = this.generators[type];
    if (!gen) throw new BadRequestException(`Unsupported code type: ${type}`);
    return gen;
  }

  // QR SKUs start with "qr-", EAN-13 SKUs are 13 digits
  detectType(sku: string): CodeType {
    return sku.startsWith('qr-') ? 'qrcode' : 'ean13';
  }

  // ---------- Create (the only place that saves) ----------

  async create(dto: CreateBarcodedItemDto, type: CodeType = 'ean13') {
    const gen = this.getGenerator(type);

    const nameTaken = await this.prisma.barcoded_items.findFirst({
      where: { prod_name: dto.prod_name },
    });
    if (nameTaken) throw new BadRequestException('Product name already exists');

    for (let attempt = 0; attempt < 5; attempt++) {
      const sku = gen.createSku();
      const image = await gen.generateImage(sku); // fails early if the SKU is invalid

      try {
        const item = await this.prisma.barcoded_items.create({
          data: {
            barcode_sku: sku,
            prod_name: dto.prod_name,
            quantity: dto.quantity,
            status: dto.status ?? 'active',
          },
        });
        return { item, type, imageBase64: image.toString('base64') };
      } catch (e: any) {
        const skuCollision =
          e?.code === 'P2002' && String(e.meta?.target).includes('barcode_sku');
        if (!skuCollision) throw e;
        // SKU collided, loop and generate a new one
      }
    }
    throw new ConflictException('Could not generate a unique SKU');
  }

  // ---------- Image for an existing item ----------

  async getImages(skus: string[], type?: CodeType) {
    const results: { sku: string; imageBase64: string }[] = [];
    for (const sku of skus) {
      const item = await this.getBySku(sku);
      const gen = this.getGenerator(type ?? this.detectType(item.barcode_sku));
      const img = await gen.generateImage(item.barcode_sku);
      results.push({ sku: item.barcode_sku, imageBase64: img.toString('base64') });
    }
    return results; // outside the loop
  }
  // ---------- Lookup and CRUD ----------

  async printPdf(sku: string[], type?: CodeType): Promise<StreamableFile>{
    const formattedItems: LabelItem[] = [];
    for(const file of sku){
      console.log(file)
      const items = await this.getBySku(file)
      console.log(items)

      const gen = this.getGenerator(type ?? this.detectType(items.barcode_sku))
      const imageBuffer = await gen.generateImage(items.barcode_sku)

     formattedItems.push({
        productName: items.prod_name,
        sku: items.barcode_sku,
        quantity: items.quantity,
        barcodeImageBase64: `data:image/png;base64,${imageBuffer.toString('base64')}`
      });
    }
   
    console.log(formattedItems)

    const templateData = {
      items: formattedItems
    };
    console.log(`Template Data: `,templateData)
      return await this.printPDF.generatePDF(templateData, {
      title: `Print Batch SKUs`,
      format: 'A4'
    });
  }

  getAll() {
    return this.prisma.barcoded_items.findMany();
  }

  async getBySku(sku: string) {
    
      const item = await this.prisma.barcoded_items.findUnique({
        where: { barcode_sku: sku.trim() },
      });
    
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async getById(id: number) {
    const item = await this.prisma.barcoded_items.findUnique({ where: { barc_id: id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: number, data: Partial<CreateBarcodedItemDto>) {
    await this.getById(id);
    return this.prisma.barcoded_items.update({ where: { barc_id: id }, data });
  }

  async remove(id: number) {
    await this.getById(id);
    await this.prisma.barcoded_items.delete({ where: { barc_id: id } });
    return { deleted: true };
  }
}