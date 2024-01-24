import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { PaginationAndQueryDTO } from "../common.dto";

export class ProductImageDTO {
   @IsString()
   @IsNotEmpty()
   publicUrl: string;

   @IsString()
   @IsNotEmpty()
   secureUrl: string;
}

export class ProductDTO {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsNotEmpty()
   description: string;

   @IsNumber()
   @IsNotEmpty()
   price: number;

   @IsNumber()
   @IsNotEmpty()
   stock: number;

   @IsOptional()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => ProductImageDTO)
   images: Array<ProductImageDTO>;

   @IsString()
   @IsNotEmpty()
   @IsEnum(["keyboard", "mouse", "mouse-pad", "cooling-pad", "headset"])
   category: "keyboard" | "mouse" | "mouse-pad" | "cooling-pad" | "headset";
}

export class ProductAdminSearchDTO extends PaginationAndQueryDTO {
   @IsOptional()
   @IsString()
   stock: string;
}

export class ProductSearchDTO {
   @IsOptional()
   @ValidateIf((o) => Array.isArray(o.myVar) || typeof o.myVar === "string")
   @IsArray({ each: true })
   @IsString({ each: true })
   category: string | Array<string>;

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   price_gte: number;

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   price_lte: number;

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   rating_lte: number;

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   rating_gte: number;

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   page: number;

   @IsOptional()
   @IsString()
   query: string;
}
