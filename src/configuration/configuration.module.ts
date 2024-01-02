import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

const Configuration = ConfigModule.forRoot({
   envFilePath: [".env"],
   isGlobal: true,
   cache: true,
   expandVariables: true,
});

@Module({
   imports: [Configuration],
})
export default class ConfigurationModule {}
