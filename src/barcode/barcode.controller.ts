import {
  Body, Controller, Delete, Get, Head, Header, Param, ParseIntPipe, Patch, Post, Query, Res, StreamableFile,
} from '@nestjs/common';
import { CreateBarcodedItemDto } from './barcode.dto/barcode.dto.js';
import { UpdateBarcodedItemDto } from './barcode.dto/barcode.dto.js';
import { GenerateBarcodeDto } from './barcode.dto/generate-barcode.dto.js';
import { BarcodedItemsService } from './service/barcode.service.js';
import { CodeTypeQueryDto } from './barcode.dto/code-type-query.dto.js';
import { BarcodePrintService } from './service/barcode-print.service.js';
import type { Response } from 'express';
import { ParseCsvPipe } from '../pipes/parse-csv.pipe.js';
@Controller('barcode')
export class BarcodeController {
  constructor(private readonly items: BarcodedItemsService , private readonly printService: BarcodePrintService) {}

  @Post()
  create(@Body() dto: CreateBarcodedItemDto, @Query() q: CodeTypeQueryDto) {
    return this.items.create(dto, q.type);
  }

  @Post('print') 
  async print( @Body('category') category: string, 
    @Body('filename') filename: string[],
    @Body('options') options: any,
    @Body('copies') copies: number) {
      const printResults = await this.printService.printPdfFile(filename, options, copies);
        return {
        success: true,
        category: category,
        results: printResults
    };
  }

  @Get()
  getAll() {
    return this.items.getAll();
  }

  @Get('lookup/:sku')
  getBySku(@Param('sku') sku: string) {
    return this.items.getBySku(sku);
  }

  @Get('lookup/:sku/images')
  async images(
    @Param('sku', ParseCsvPipe) skus: string[],
    @Query() q: CodeTypeQueryDto,
  ) {
    return this.items.getImages(skus, q.type);
  }

  @Get('lookup/:sku/pdf')
  async printPdf(
    @Param('sku') sku: string,
    @Query() q: CodeTypeQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const skus = sku.split(',').map((s) => s.trim()).filter(Boolean);
    const pdf = await this.items.printPdf(skus, q.type);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="barcode-label.pdf"',
    });
    return pdf;
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.items.getById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBarcodedItemDto) {
    return this.items.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.items.remove(id);
  }
}