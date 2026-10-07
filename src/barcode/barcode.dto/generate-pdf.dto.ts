import { IsString, IsNumber, IsEnum, IsBoolean, IsObject, IsOptional } from 'class-validator';

export class PdfAttributesDto {
  @IsOptional()
  @IsEnum(['A4', 'A3', 'Letter', 'Legal'])
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';

  @IsOptional()
  @IsBoolean()
  landscape?: boolean = false

  @IsOptional()
  @IsNumber()
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  
  @IsOptional()
  @IsString()
  width?: string

  @IsOptional()
  @IsString()
  height?: string

  @IsOptional()
  @IsBoolean()
  displayHeaderFooter?: boolean = false;

  @IsOptional()
  @IsString()
  headerTemplate?: string

  @IsOptional()
  @IsString()
  footerTemplate?: string

  @IsOptional()
  @IsString()
  title?: string;
}

export class GeneratePdfDto {
  @IsObject()
  data: any; // Context data for your template

  @IsOptional()
  @IsObject()
  attributes?: PdfAttributesDto;
}
