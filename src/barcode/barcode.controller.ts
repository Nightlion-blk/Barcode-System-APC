import {
  Body, Controller, Delete, Get, Header, Param, ParseIntPipe, Patch, Post, Query, StreamableFile,
} from '@nestjs/common';
import { CreateBarcodedItemDto } from './barcode.dto/barcode.dto.js';
import { UpdateBarcodedItemDto } from './barcode.dto/barcode.dto.js';
import { GenerateBarcodeDto } from './barcode.dto/generate-barcode.dto.js';
import { BarcodedItemsService } from './barcode.service.js';
import { CodeTypeQueryDto } from './barcode.dto/code-type-query.dto.js';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly items: BarcodedItemsService) {}

  // ---------- Existing ----------

   @Post()
  create(@Body() dto: CreateBarcodedItemDto, @Query() q: CodeTypeQueryDto) {
    return this.items.create(dto, q.type);
  }

  @Get()
  getAll() {
    return this.items.getAll();
  }

  @Get('lookup/:sku')
  getBySku(@Param('sku') sku: string) {
    return this.items.getBySku(sku);
  }

  @Get('lookup/:sku/image')
  @Header('Content-Type', 'image/png')
  async image(@Param('sku') sku: string, @Query() q: CodeTypeQueryDto) {
    return new StreamableFile(await this.items.getImage(sku, q.type));
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