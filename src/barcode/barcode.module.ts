import { Module } from "@nestjs/common";
import { BarcodeController } from "./barcode.controller.js";
import { BarcodeGeneratorService } from "./service/barcode-generator.service.js";
import { BarcodedItemsService } from "./service/barcode.service.js";
import { QrGeneratorService } from "./service/qrcode-generator.service.js";
import { PrismaModule } from '../prisma/prisma.module.js';
import { BarcodePdfService } from "./service/barcodePdf.service.js";
import { BarcodePrintService } from "./service/barcode-print.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [BarcodeController],
  providers: [
    BarcodedItemsService,
    BarcodeGeneratorService,
    BarcodePrintService,
    QrGeneratorService,
    BarcodePdfService
  ],
})
export class BarcodeModule {}