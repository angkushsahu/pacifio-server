import { IsNotEmpty, IsString, IsNumberString } from "class-validator";

export class AddressDTO {
   @IsNumberString()
   @IsNotEmpty()
   contactNumber: string;

   @IsString()
   @IsNotEmpty()
   location: string;

   @IsString()
   @IsNotEmpty()
   city: string;

   @IsString()
   @IsNotEmpty()
   state: string;

   @IsString()
   @IsNotEmpty()
   pincode: string;

   @IsString()
   @IsNotEmpty()
   country: string;
}
