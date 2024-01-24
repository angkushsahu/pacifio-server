import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ShoppingBagDTO {
   @IsNotEmpty()
   @IsString()
   productId: string;

   @IsNotEmpty()
   @IsNumber()
   quantity: number;
}
