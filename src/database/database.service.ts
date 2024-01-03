import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class MongooseConfigService implements MongooseOptionsFactory {
   createMongooseOptions(): MongooseModuleOptions | Promise<MongooseModuleOptions> {
      const uri = process.env.DATABASE_URI;
      return { uri };
   }
}
