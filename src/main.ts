import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import AppModule from "./app.module";

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.enableCors({ origin: process.env.CLIENT_URL, credentials: true });
   app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true, transform: true, whitelist: true }));
   app.setGlobalPrefix("api");
   await app.listen(process.env.PORT || 8080);
}

bootstrap();
