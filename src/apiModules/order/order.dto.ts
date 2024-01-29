import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

import { PaginationAndQueryDTO } from "../common.dto";

export class OrderProductsDTO {
   @IsNotEmpty()
   @IsString()
   addressId: string;
}

export class GetAllOrdersDTO {
   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   page: number;
}

export class OrderAdminSearchDTO extends PaginationAndQueryDTO {
   @IsOptional()
   @IsString()
   @IsEnum(["processing", "shipped", "delivered"])
   status: "processing" | "shipped" | "delivered";
}
