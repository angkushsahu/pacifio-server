import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

import type {
   IOrderModel,
   IUserDocument,
   IShoppingBagModel,
   IAddressModel,
   OrderProducts,
   IProductDocument,
   IProductModel,
} from "src/models";
import { ADDRESS_MODEL, ORDER_MODEL, PRODUCT_MODEL, SHOPPING_BAG_MODEL } from "src/models";
import { GetAllOrdersDTO, OrderProductsDTO } from "../order.dto";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class OrderService {
   private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2023-10-16" });

   constructor(
      @InjectModel(ORDER_MODEL) private readonly orderModel: IOrderModel,
      @InjectModel(ADDRESS_MODEL) private readonly addressModel: IAddressModel,
      @InjectModel(SHOPPING_BAG_MODEL) private readonly shoppingBagModel: IShoppingBagModel,
      @InjectModel(PRODUCT_MODEL) private readonly productModel: IProductModel
   ) {}

   async createOrder({ body, statusCode, user }: { user: IUserDocument; body: OrderProductsDTO } & IStatusCode) {
      try {
         const { addressId } = body;
         let shoppingBag = await this.shoppingBagModel.findOne({ user: user._id }).populate({ path: "products.product" });
         if (!shoppingBag) throw new ErrorHandler({ message: "Shopping bag not found", statusCode: 404 });

         const address = await this.addressModel.findById(addressId);
         if (!address || user.id !== address.user.toString())
            throw new ErrorHandler({ message: "Address not found", statusCode: 404 });

         let totalPrice = 0;
         const orderedProducts: Array<OrderProducts> = [];

         await Promise.all(
            shoppingBag.products.map(async ({ product, quantity }) => {
               if (product === null || product === undefined) return;

               const existingProduct = await this.productModel.findById((product as IProductDocument).id);
               if (!existingProduct) return;

               existingProduct.stock -= quantity;
               await existingProduct.save();

               const itemPrice = quantity * (product as IProductDocument).price;
               totalPrice += itemPrice;
               const { category, defaultImage, name, price, _id } = product as IProductDocument;
               orderedProducts.push({
                  category,
                  image: defaultImage.secureUrl,
                  itemPrice,
                  name,
                  price,
                  productId: _id,
                  quantity,
               });
            })
         );

         const order = await this.orderModel.create({
            address,
            user: user._id,
            paymentInfo: { status: "not-paid" },
            deliveryInfo: { status: "processing" },
            products: orderedProducts,
            totalPrice,
         });
         if (!order) throw new ErrorHandler({ message: "Unable to place new order, please try again", statusCode: 500 });
         return {
            success: true,
            message: "Order placed successfully",
            statusCode,
            data: { order: order.getOrder(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async acceptPayment({ user, orderId, statusCode }: { user: IUserDocument; orderId: string } & IStatusCode) {
      try {
         const order = await this.orderModel.findById(orderId);
         if (!order || order.user.toString() !== user.id) throw new ErrorHandler({ message: "Order not found", statusCode: 404 });

         if (order.paymentInfo.status === "paid")
            throw new ErrorHandler({ message: "You have already paid for this order", statusCode: 400 });

         const { totalPrice } = order;
         const payment = await this.stripe.paymentIntents.create({
            amount: totalPrice * 100, // converting rupee to paise
            currency: "INR",
            metadata: { company: "Pacifio" },
            payment_method: "pm_card_visa",
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: "never" },
            off_session: true,
         });
         if (!payment) throw new ErrorHandler({ message: "Unable to process payment, please try again", statusCode: 500 });

         order.paymentInfo = { status: "paid", id: payment.id, time: new Date() };
         await order.save();

         await this.shoppingBagModel.deleteOne({ user: user._id });

         return {
            success: true,
            message: "Payment successfull",
            statusCode,
            data: { order: order.getOrder(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAllOrders({
      user,
      resultsPerPage,
      statusCode,
      queryParams,
   }: { user: IUserDocument; queryParams: GetAllOrdersDTO; resultsPerPage: number } & IStatusCode) {
      try {
         let { page } = queryParams;
         if (!page) page = 1;

         const allOrders = await this.orderModel
            .find({ user: user._id })
            .sort({ createdAt: -1 })
            .skip(resultsPerPage * (page - 1))
            .limit(resultsPerPage)
            .populate({ path: "user", select: "id name email role createdAt" });
         const orders = allOrders.map((order) => {
            return order.getOrder((order.user as IUserDocument).getUser());
         });
         if (!orders) throw new ErrorHandler({ message: "Unable to find orders", statusCode: 500 });

         const totalOrders = await this.orderModel.countDocuments();
         const totalPages = Math.ceil(totalOrders / resultsPerPage);

         return {
            success: true,
            message: "Orders found successfully",
            statusCode,
            data: { totalOrders, totalPages, numberOfFetchedOrders: orders.length, orders },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getOrder({ user, orderId, statusCode }: { user: IUserDocument; orderId: string } & IStatusCode) {
      try {
         const order = await this.orderModel.findById(orderId);
         if (!order || order.user.toString() !== user.id) throw new ErrorHandler({ message: "Order not found", statusCode: 404 });

         return {
            success: true,
            message: "Order found successfully",
            statusCode,
            data: { order: order.getOrder(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
