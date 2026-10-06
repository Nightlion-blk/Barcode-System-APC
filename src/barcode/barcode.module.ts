import { Module } from "@nestjs/common";
import { BarcodeController } from "./barcode.controller.js";
import { BarcodeGeneratorService } from "./barcode-generator.service.js";
import { BarcodedItemsService } from "./barcode.service.js";
import { QrGeneratorService } from "./qrcode-generator.service.js";
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [BarcodeController],
  providers: [
    BarcodedItemsService,
    BarcodeGeneratorService,
    QrGeneratorService,
  ],
})
export class BarcodeModule {}