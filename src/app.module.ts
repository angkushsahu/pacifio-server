import { APP_FILTER } from "@nestjs/core";
import { Module } from "@nestjs/common";

import { ConfigurationModule } from "./configuration";
import { AppExceptionFilter } from "./exceptions";
import { DatabaseModule } from "./database";
import * as ApiModule from "./apiModules";
import { SchemaModule } from "./models";

@Module({
   imports: [
      ConfigurationModule,
      DatabaseModule,
      SchemaModule,
      ApiModule.AuthModule,
      ApiModule.UserModule,
      ApiModule.RouteNotFoundModule,
   ],
   providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }],
})
export default class AppModule {}
