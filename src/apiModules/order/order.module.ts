import { Module } from "@nestjs/common";

import OrderVisualizationController from "./controllers/order.visualize.conroller";
import OrderVisualizationService from "./services/order.visualize.service";
import OrderAdminController from "./controllers/order.admin.controller";
import OrderAdminService from "./services/order.admin.service";
import OrderController from "./controllers/order.controller";
import OrderService from "./services/order.service";

@Module({
   controllers: [OrderController, OrderVisualizationController, OrderAdminController],
   providers: [OrderService, OrderVisualizationService, OrderAdminService],
})
export default class OrderModule {}
