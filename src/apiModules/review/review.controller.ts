import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { GetAllReviewsDTO, ReviewDTO } from "./review.dto";
import type { CustomRequest } from "src/types";
import ReviewService from "./review.service";
import { IdParam } from "../common.dto";

@Controller("review")
export default class ReviewController {
   constructor(private readonly reviewService: ReviewService) {}

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Post("add")
   editReview(@Req() request: CustomRequest, @Body() body: ReviewDTO) {
      return this.reviewService.editReview({ user: request.user, body, statusCode: 201 });
   }

   @HttpCode(200)
   @Get(":id/all")
   getAllReviews(@Param() params: IdParam, @Query() queryParams: GetAllReviewsDTO) {
      return this.reviewService.getAllReviews({ resultsPerPage: 6, statusCode: 200, queryParams, productId: params.id });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Get(":id")
   getReview(@Req() request: CustomRequest, @Param() params: IdParam) {
      return this.reviewService.getReview({ user: request.user, productId: params.id, statusCode: 200 });
   }

   @HttpCode(200)
   @Get(":id/get-by-id")
   getReviewById(@Param() params: IdParam) {
      return this.reviewService.getReviewById({ reviewId: params.id, statusCode: 200 });
   }

   @HttpCode(200)
   @UseGuards(AuthGuard("jwt"))
   @Delete(":id")
   deleteReview(@Req() request: CustomRequest, @Param() params: IdParam) {
      return this.reviewService.deleteReview({ user: request.user, productId: params.id, statusCode: 200 });
   }
}
