// barcode.dto/code-type-query.dto.ts
import { IsIn, IsOptional } from 'class-validator';
import { CODE_TYPES } from '../Interface/item.interfact.js';
import type { CodeType } from '../Interface/item.interfact.js';
export class CodeTypeQueryDto {
  @IsOptional()
  @IsIn(CODE_TYPES)
  type?: CodeType;
}