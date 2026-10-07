import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export const ITEM_STATUSES = ['in_stock', 'out_of_stock', 'low_stock', 'discontinued', 'inactive'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateBarcodedItemDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  prod_name!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @Transform(trim)
  @IsIn(ITEM_STATUSES)
  status?: ItemStatus; 
}

export class UpdateBarcodedItemDto extends PartialType(CreateBarcodedItemDto) {}