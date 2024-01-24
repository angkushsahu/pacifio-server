import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetAllReviewsDTO {
   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   page: number;
}

export class ReviewDTO {
   @IsNumber()
   @IsNotEmpty()
   @Min(1, { message: "Minimum rating is 1" })
   @Max(5, { message: "Maximum rating is 5" })
   rating: number;

   @IsString()
   @IsNotEmpty()
   comment: string;

   @IsString()
   @IsNotEmpty()
   productId: string;
}
