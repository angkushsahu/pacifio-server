import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import type { Document } from "mongoose";

import type { IProductModel, IShoppingBagModel, IUserDocument, IProductDocument, ShoppingBagProducts } from "src/models";
import { PRODUCT_MODEL, SHOPPING_BAG_MODEL, ShoppingBag } from "src/models";
import { ShoppingBagDTO } from "./shoppingBag.dto";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class ShoppingBagService {
   constructor(
      @InjectModel(SHOPPING_BAG_MODEL) private readonly shoppingBagModel: IShoppingBagModel,
      @InjectModel(PRODUCT_MODEL) private readonly productModel: IProductModel
   ) {}

   private async returnShoppingBagObject(shoppingBag: Document & ShoppingBag) {
      // populate the shopping bag variable with product details
      shoppingBag = await shoppingBag.populate({ path: "products.product", select: "_id name defaultImage price stock" });

      let totalPrice = 0;
      const updatedProducts: Array<ShoppingBagProducts & { itemPrice: number }> = [];
      shoppingBag.products = shoppingBag.products.filter(({ product, quantity }, idx) => {
         if (product === null || product === undefined) return false;

         const itemPrice = quantity * (product as IProductDocument).price;
         updatedProducts[idx] = { itemPrice, quantity, product };
         totalPrice += itemPrice;
         return true;
      });

      const totalProducts = shoppingBag.products.length;
      const updatedBag = { user: shoppingBag.user, id: shoppingBag.id, totalPrice, totalProducts, products: updatedProducts };
      return { shoppingBag: updatedBag };
   }

   async getShoppingBag({ statusCode, user }: IStatusCode & { user: IUserDocument }) {
      try {
         let shoppingBag = await this.shoppingBagModel.findOne({ user: user._id });
         if (!shoppingBag) shoppingBag = await this.shoppingBagModel.create({ user: user._id });

         const data = await this.returnShoppingBagObject(shoppingBag);
         return { success: true, message: "Found shopping-bag successfully", statusCode, data };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async addProductToBag({ body, statusCode, user }: IStatusCode & { body: ShoppingBagDTO; user: IUserDocument }) {
      try {
         // find if shopping bag for a user is present, if not, create one
         let shoppingBag = await this.shoppingBagModel.findOne({ user: user._id });
         if (!shoppingBag) shoppingBag = await this.shoppingBagModel.create({ user: user._id });

         // find the product
         const product = await this.productModel.findById(body.productId);
         if (!product) throw new ErrorHandler({ message: "Product not found", statusCode: 404 });

         // check for available stock
         if (body.quantity <= 0) throw new ErrorHandler({ message: "Enter a valid quantity", statusCode: 400 });
         if (body.quantity > product.stock)
            throw new ErrorHandler({ message: "The requested quantity exceeds the available stock", statusCode: 400 });

         // if product is already present in array, update it
         let productAlreadyPresent = false;
         for (let i = 0; i < shoppingBag.products.length; i++) {
            if (shoppingBag.products[i].product.toString() === product._id.toString()) {
               shoppingBag.products[i].quantity = body.quantity;
               productAlreadyPresent = true;
               break;
            }
         }
         // else push a new item to the shopping bag
         if (!productAlreadyPresent) shoppingBag.products.push({ product: product._id, quantity: body.quantity });
         await shoppingBag.save();

         const data = await this.returnShoppingBagObject(shoppingBag);
         return { success: true, message: "Product added to bag", statusCode, data };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async removeProductFromBag({ productId, statusCode, user }: IStatusCode & { productId: string; user: IUserDocument }) {
      try {
         let shoppingBag = await this.shoppingBagModel.findOne({ user: user._id });
         if (!shoppingBag) throw new ErrorHandler({ message: "Shopping bag not found", statusCode: 404 });

         shoppingBag.products = shoppingBag.products.filter(({ product }) => product.toString() !== productId);
         await shoppingBag.save();

         const data = await this.returnShoppingBagObject(shoppingBag);
         return { success: true, message: "Product removed from bag", statusCode, data };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
