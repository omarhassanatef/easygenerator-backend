import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongoModule } from "./database/mongo.module";
import { LoggerModule } from "./shared/logger/logger.module";
import { AuthModule } from "./modules/auth/auth.module";
import { validate } from "./shared/config/env.config";
import { ContextMiddleware } from "./shared/middleware/context.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    MongoModule,
    LoggerModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes("*");
  }
}
