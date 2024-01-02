import { MongooseModule } from "@nestjs/mongoose";
import { Global, Module } from "@nestjs/common";

import { USER_MODEL, UserSchema } from "./user.model";

const MODELS = [{ name: USER_MODEL, schema: UserSchema }];

@Global()
@Module({
   imports: [MongooseModule.forFeature(MODELS)],
   exports: [MongooseModule],
})
export default class SchemaModule {}
