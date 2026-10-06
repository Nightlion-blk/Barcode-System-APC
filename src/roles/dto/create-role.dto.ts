import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { role_status } from '../../generated/prisma/client.js';

export class CreateRoleDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  role_name!: string;

  @IsOptional()
  @IsEnum(role_status)
  status?: role_status;

  @IsOptional()
  @IsInt()
  @Min(1)
  permission_id?: number | null;
}
