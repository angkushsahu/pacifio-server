import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import MongooseConfigService from "./database.service";

@Module({
   imports: [MongooseModule.forRootAsync({ useClass: MongooseConfigService })],
   exports: [MongooseModule],
})
export default class DatabaseModule {}
