import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class IdParam {
   @IsString()
   @IsNotEmpty()
   id: string;
}

export class PaginationAndQueryDTO {
   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   page: number;

   @IsOptional()
   @IsString()
   query: string;
}
