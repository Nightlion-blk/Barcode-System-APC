import { Injectable, StreamableFile } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { PdfAttributesDto } from '../barcode.dto/generate-pdf.dto.js';
import { LabelItem } from '../Interface/item.interfact.js';
@Injectable()
export class BarcodePdfService {
    async generatePDF(data:{ items: LabelItem[] }, attribute: PdfAttributesDto = {}): Promise<StreamableFile> {
        console.log('items:', data.items.length, data.items.map(i => i.sku));

        const templatePath = path.join(process.cwd(), 'templates/barcodetemplate.hbs');
        let templateHtml = fs.readFileSync(templatePath, 'utf8')

        if(attribute.title){
            templateHtml = templateHtml.replace('<head>', `<head><title>${attribute.title}</title>`)
        }

        const compileTemplate = handlebars.compile(templateHtml)

        const items = data.items.flatMap(i => Array(i.quantity ?? 1).fill(i));
        const html = compileTemplate({items});
    
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });

        const pdfBuffer = await page.pdf({
            format: attribute.format,
            landscape: attribute.landscape,
            margin: attribute.margin,
            displayHeaderFooter: attribute.displayHeaderFooter,
            headerTemplate: attribute.headerTemplate || `<span></span>`,
            footerTemplate: attribute.footerTemplate || `<span></span>`,
            printBackground: true,
        })

        await browser.close();
        return new StreamableFile(pdfBuffer);
    }
}