import { Controller, Get, HttpCode, Param, Query } from "@nestjs/common";

import ProductService from "../services/product.service";
import { ProductSearchDTO } from "../product.dto";
import { IdParam } from "../../common.dto";

@Controller("product")
export default class ProductController {
   constructor(private readonly productService: ProductService) {}

   @HttpCode(200)
   @Get("highest-rated")
   getHighestRatedProducts() {
      return this.productService.getHighestRatedProducts({ statusCode: 200 });
   }

   @HttpCode(200)
   @Get("all")
   getAllProducts(@Query() queryParams: ProductSearchDTO) {
      return this.productService.getAllProducts({ statusCode: 200, queryParams, resultsPerPage: 6 });
   }

   @HttpCode(200)
   @Get(":id")
   getProduct(@Param() params: IdParam) {
      return this.productService.getProduct({ statusCode: 200, id: params.id });
   }
}
