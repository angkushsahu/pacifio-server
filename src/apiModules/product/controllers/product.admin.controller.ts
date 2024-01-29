import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ProductAdminSearchDTO, ProductDTO, ProductImageDTO } from "../product.dto";
import ProductAdminService from "../services/product.admin.service";
import { Roles, UserRoleGuard } from "src/userRoleCheck";
import { IdParam } from "../../common.dto";

@Controller("product/admin")
export default class ProductAdminController {
   constructor(private readonly productAdminService: ProductAdminService) {}

   @HttpCode(201)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Post("create")
   createProduct(@Body() productBody: ProductDTO) {
      return this.productAdminService.createProduct({ productBody, statusCode: 201 });
   }

   @HttpCode(201)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Post(":id/image")
   addProductImage(@Body() productImage: ProductImageDTO, @Param() params: IdParam) {
      return this.productAdminService.addProductImage({ productImage, statusCode: 201, id: params.id });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Put(":id/image")
   deleteProductImage(@Body() productImage: ProductImageDTO, @Param() params: IdParam) {
      return this.productAdminService.deleteProductImage({ productImage, statusCode: 200, id: params.id });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Put(":id/default-image")
   setDefaultProductImage(@Body() productImage: ProductImageDTO, @Param() params: IdParam) {
      return this.productAdminService.setDefaultProductImage({ productImage, statusCode: 200, id: params.id });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Put(":id")
   updateProduct(@Body() productBody: ProductDTO, @Param() params: IdParam) {
      return this.productAdminService.updateProduct({ productBody, statusCode: 200, id: params.id });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Delete(":id")
   deleteProduct(@Param() params: IdParam) {
      return this.productAdminService.deleteProduct({ statusCode: 200, id: params.id });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("all")
   getAllProductsForAdmin(@Query() queryParams: ProductAdminSearchDTO) {
      return this.productAdminService.getAllProductsForAdmin({ statusCode: 200, queryParams, resultsPerPage: 8 });
   }

   @HttpCode(200)
   @Roles("admin", "super-admin")
   @UseGuards(AuthGuard("jwt"), UserRoleGuard)
   @Get("info")
   productInfo() {
      return this.productAdminService.productInfo({ statusCode: 200 });
   }
}
