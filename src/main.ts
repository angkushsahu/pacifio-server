import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
// import * as cookieParser from "cookie-parser" --> depends upon requirement

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.enableCors({ origin: process.env.CLIENT_URL, credentials: true });
   app.useGlobalPipes(
      new ValidationPipe({ forbidNonWhitelisted: true, forbidUnknownValues: true, transform: true, whitelist: true })
   );
   app.setGlobalPrefix("api");
   // app.use(cookieParser()); --> depends upon requirement
   await app.listen(process.env.PORT || 8080);
}

bootstrap();
