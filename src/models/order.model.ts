import { Document, type Model, type InferSchemaType, Schema as mongooseSchema } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

import { type IUserDocument, USER_MODEL, IUser } from "./user.model";
import { Address } from "./address.model";

@Schema()
class DeliveryInfo {
   @Prop({ type: String, enum: ["processing", "shipped", "delivered"], default: "processing" })
   status: "processing" | "shipped" | "delivered";

   @Prop({ type: Date, default: null })
   time: Date | string;
}

@Schema()
class PaymentInfo {
   @Prop({ type: String, enum: ["paid", "not-paid"], default: "not-paid" })
   status: "paid" | "not-paid";

   @Prop({ type: String, default: null })
   id: string;

   @Prop({ type: Date, default: null })
   time: Date | string;
}

@Schema({ timestamps: true, collection: "orders" })
export class Order {
   @Prop({ type: Address, required: [true, "Please enter delivery address and contact details"] })
   address: Address;

   @Prop({ type: mongooseSchema.Types.ObjectId, ref: USER_MODEL, required: [true, "Please specify user ID"] })
   user: string | mongooseSchema.Types.ObjectId | IUserDocument;

   @Prop({ type: DeliveryInfo, _id: false })
   deliveryInfo: DeliveryInfo;

   @Prop({ type: PaymentInfo, _id: false })
   paymentInfo: PaymentInfo;

   @Prop({ type: Number, required: [true, "Please enter the total price of the order"] })
   totalPrice: number;

   @Prop({
      type: [
         {
            productId: { type: mongooseSchema.Types.ObjectId, required: [true, "Please specify the id of the product"] },
            name: { type: String, required: [true, "Please specify the name of the product"] },
            price: { type: Number, required: [true, "Please specify the price of the product"] },
            quantity: { type: Number, required: [true, "Please specify the number of items purchased"] },
            itemPrice: { type: Number, required: [true, "Please specify the price of items purchased"] },
            image: { type: String, default: "" },
            category: {
               type: String,
               enum: ["keyboard", "mouse", "mouse-pad", "cooling-pad", "headset"],
               required: [true, "Please specify the category of the product"],
            },
            _id: false,
         },
      ],
   })
   products: Array<OrderProducts>;

   getOrder: (this: IOrderDocument, user: IUser) => IOrder;
}

export const ORDER_MODEL = Order.name;
export const OrderSchema = SchemaFactory.createForClass(Order);

export type OrderProducts = {
   productId: string | mongooseSchema.Types.ObjectId;
   name: string;
   price: number;
   quantity: number;
   itemPrice: number;
   image: string;
   category: "keyboard" | "mouse" | "mouse-pad" | "cooling-pad" | "headset";
};

export type IOrderSchemaType = InferSchemaType<typeof OrderSchema> & { createdAt: Date | string; id: string };
export type IOrder = Pick<
   IOrderSchemaType,
   "address" | "createdAt" | "deliveryInfo" | "id" | "paymentInfo" | "products" | "totalPrice" | "user"
>;
export type IOrderDocument = IOrderSchemaType & Document;
export type IOrderModel = Model<IOrderDocument>;

OrderSchema.methods.getOrder = function (this: IOrderDocument, user: IUser): Omit<IOrder, "user"> & { user: IUser } {
   const formatTimeOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
   };
   const formattedDate = new Intl.DateTimeFormat("en-US", formatTimeOptions).format(this.createdAt as Date);

   let formattedPaymentDate: string | null = null;
   if (this.paymentInfo.time)
      formattedPaymentDate = new Intl.DateTimeFormat("en-US", formatTimeOptions).format(this.paymentInfo.time as Date);

   let formattedDeliveryDate: string | null = null;
   if (this?.deliveryInfo?.time)
      formattedDeliveryDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
         this.deliveryInfo.time as Date
      );

   return {
      id: this.id,
      user,
      address: this.address,
      products: this.products,
      deliveryInfo: { status: this?.deliveryInfo?.status || "processing", time: formattedDeliveryDate as string },
      paymentInfo: { id: this.paymentInfo.id, status: this.paymentInfo.status, time: formattedPaymentDate as string },
      totalPrice: this.totalPrice,
      createdAt: formattedDate,
   };
};
