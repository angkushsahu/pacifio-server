import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { Module } from "@nestjs/common";

import { ConfigurationModule } from "./configuration";
import { AppExceptionFilter } from "./exceptions";
import { RateLimitModule } from "./rateLimit";
import { DatabaseModule } from "./database";
import * as ApiModule from "./apiModules";
import { SchemaModule } from "./models";

@Module({
   imports: [
      RateLimitModule,
      ConfigurationModule,
      DatabaseModule,
      SchemaModule,
      ApiModule.ContactModule,
      ApiModule.AuthModule,
      ApiModule.UserModule,
      ApiModule.AddressModule,
      ApiModule.ProductModule,
      ApiModule.ReviewModule,
      ApiModule.ShoppingBagModule,
      ApiModule.OrderModule,
      ApiModule.RouteNotFoundModule,
   ],
   providers: [
      { provide: APP_GUARD, useClass: ThrottlerGuard },
      { provide: APP_FILTER, useClass: AppExceptionFilter },
   ],
})
export default class AppModule {}
