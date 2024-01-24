import { Document, type Model, type InferSchemaType, Schema as mongooseSchema } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

import { USER_MODEL, type IUser, type IUserDocument } from "./user.model";

@Schema({ timestamps: true, collection: "addresses" })
export class Address {
   @Prop({ type: mongooseSchema.Types.ObjectId, ref: USER_MODEL, required: [true, "Please enter ID of the user"] })
   user: string | mongooseSchema.Types.ObjectId | IUserDocument;

   @Prop({ type: String, required: [true, "Please enter your contact number"] })
   contactNumber: string;

   @Prop({ type: String, required: [true, "Please enter your location"] })
   location: string;

   @Prop({ type: String, required: [true, "Please enter your city"] })
   city: string;

   @Prop({ type: String, required: [true, "Please enter your state"] })
   state: string;

   @Prop({ type: String, required: [true, "Please enter your pincode"] })
   pincode: string;

   @Prop({ type: String, required: [true, "Please enter your country"] })
   country: string;

   getAddress: (this: IAddressDocument, user: IUser) => IAddress;
}

export const ADDRESS_MODEL = Address.name;
export const AddressSchema = SchemaFactory.createForClass(Address);

export type IAddressSchemaType = InferSchemaType<typeof AddressSchema> & { createdAt: Date | string };
export type IAddress = Pick<
   IAddressSchemaType,
   "city" | "contactNumber" | "country" | "createdAt" | "location" | "pincode" | "state" | "user"
> & { id: string };
export type IAddressDocument = IAddressSchemaType & Document;
export type IAddressModel = Model<IAddressDocument>;

AddressSchema.methods.getAddress = function (this: IAddressDocument, user: IUser): Omit<IAddress, "user"> & { user: IUser } {
   const formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
      this.createdAt as Date
   );

   return {
      id: this.id,
      user,
      city: this.city,
      contactNumber: this.contactNumber,
      country: this.country,
      location: this.location,
      pincode: this.pincode,
      state: this.state,
      createdAt: formattedDate,
   };
};
