import { Controller, Get, Post } from "@nestjs/common";

@Controller('barcode')
export class BarcodeController {
    constructor() {}
    
    @Get()
    findAll() {
        return "This action returns all barcodes";
    }

    @Get(':id')
    findOne() {
        return "This action returns a single barcode";
    }

    @Post()
    createProductBarcode() {
        return "This action creates a new barcode";
    }

    


}