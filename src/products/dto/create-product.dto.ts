import { Availability, ProductImages } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  price?: number;

  @IsIn([Availability.IN_STORE, Availability.ONLINE])
  availability: Availability;

  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  slug?: string;
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @IsIn(['men', 'women', 'unisex', 'kid'])
  gender: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}

// class Images {
//   @IsArray()
//   @IsOptional()
//   @IsString({ each: true })
//   create: ProductImages[];
// }
