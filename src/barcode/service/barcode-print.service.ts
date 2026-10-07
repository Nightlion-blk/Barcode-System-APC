import { Injectable } from "@nestjs/common";
import * as printer from 'pdf-to-printer';
import * as fs from 'fs/promises';
import * as path from 'path';
@Injectable()
export class BarcodePrintService {
    async printPdfFile(fileName: string [], options?: any, copies?: number): Promise<string[]> {
        const results: string[] = [];
        
        for (const file of fileName) {
        
            const filePath = path.resolve(process.cwd(), 'pdfs', file);

            await fs.access(filePath);

            await printer.print(filePath, {
                ...options,
                ...(copies && { copies })
            });

            results.push(`Printed ${file} successfully.`);
        }
        return results;
    }
}