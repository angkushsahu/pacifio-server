import { Module } from "@nestjs/common";

import ProductAdminController from "./controllers/product.admin.controller";
import ProductAdminService from "./services/product.admin.service";
import ProductController from "./controllers/product.controller";
import ProductService from "./services/product.service";

@Module({
   controllers: [ProductAdminController, ProductController],
   providers: [ProductAdminService, ProductService],
})
export default class ProductModule {}
