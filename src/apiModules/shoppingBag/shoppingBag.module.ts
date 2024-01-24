import { Module } from "@nestjs/common";

import ShoppingBagController from "./shoppingBag.controller";
import ShoppingBagService from "./shoppingBag.service";

@Module({
   controllers: [ShoppingBagController],
   providers: [ShoppingBagService],
})
export default class ShoppingBagModule {}
