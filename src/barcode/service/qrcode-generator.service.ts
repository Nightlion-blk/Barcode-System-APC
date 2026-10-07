// generators/qr-generator.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import bwipjs from 'bwip-js';
import { CodeGenerator } from '../../barcode/Interface/item.interfact.js';

@Injectable()
export class QrGeneratorService implements CodeGenerator {
  readonly type = 'qrcode' as const;

  createSku(): string {
    return `qr-209${randomInt(100_000_000, 1_000_000_000)}`;
  }

   async generateImage(sku: string): Promise<Buffer> {
    if (!sku || sku.length > 100 || !/^[-A-Za-z0-9._]+$/.test(sku)) {
      throw new BadRequestException('Invalid QR text');
    }
    const option = {
      bcid: 'qrcode',
      text: sku,
      scale: 4,
      eclevel: 'M',
      paddingwidth: 4,
      paddingheight: 4,
    };
    return bwipjs.toBuffer(option);
  }
}