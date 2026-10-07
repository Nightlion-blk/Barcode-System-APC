// generators/barcode-generator.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import bwipjs from 'bwip-js';
import { CodeGenerator } from '../../barcode/Interface/item.interfact.js';

@Injectable()
export class BarcodeGeneratorService implements CodeGenerator {
  readonly type = 'ean13' as const;

  createSku(): string {
    const base = `209${randomInt(100_000_000, 1_000_000_000)}`; // 12 digits
    return base + this.checkDigit(base);                        // 13 digits
  }

  async generateImage(sku: string): Promise<Buffer> {
    console.log(`Barcode: ${sku}`)
    if (!/^\d{12,13}$/.test(sku)){
      throw new BadRequestException('EAN-13 text must be exactly 12 or 13 digits');
    }
    return bwipjs.toBuffer({
      bcid: 'ean13',
      text: sku,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
      paddingwidth: 10,
      paddingheight: 5,
    });
  }

  private checkDigit(digits12: string): number {
    const sum = [...digits12].reduce(
      (acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3),
      0,
    );
    return (10 - (sum % 10)) % 10;
  }
}