import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Env } from "../shared/config/env.config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env, true>) => ({
        uri: configService.get("MONGODB_URI", { infer: true }),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongoModule {}
