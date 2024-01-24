import { type ModelDefinition, MongooseModule } from "@nestjs/mongoose";
import { Global, Module } from "@nestjs/common";

import { SHOPPING_BAG_MODEL, ShoppingBagSchema } from "./shoppingBag.model";
import { ADDRESS_MODEL, AddressSchema } from "./address.model";
import { PRODUCT_MODEL, ProductSchema } from "./product.model";
import { REVIEW_MODEL, ReviewSchema } from "./review.model";
import { USER_MODEL, UserSchema } from "./user.model";

const MODELS: Array<ModelDefinition> = [
   { name: USER_MODEL, schema: UserSchema },
   { name: ADDRESS_MODEL, schema: AddressSchema },
   { name: PRODUCT_MODEL, schema: ProductSchema },
   { name: REVIEW_MODEL, schema: ReviewSchema },
   { name: SHOPPING_BAG_MODEL, schema: ShoppingBagSchema },
];

@Global()
@Module({
   imports: [MongooseModule.forFeature(MODELS)],
   exports: [MongooseModule],
})
export default class SchemaModule {}
