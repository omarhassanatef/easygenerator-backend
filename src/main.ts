import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./shared/filters/global-exception.filter";
import { AppLogger } from "./shared/logger/logger.service";
import { setupSwagger } from "./shared/swagger/swagger.setup";
import { Env } from "./shared/config/env.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Env, true>);
  const logger = app.get(AppLogger);
  logger.setContext("Bootstrap");
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });
  app.use(cookieParser(configService.get("COOKIE_SECRET", { infer: true })));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  setupSwagger(app);

  const port = configService.get("PORT", { infer: true });
  await app.listen(port);

  logger.log({
    message: "Application started successfully",
    method: { name: "bootstrap", phase: "End" },
    data: {
      port,
      apiUrl: `Same as swagger url but followed by controller basepath then endpoint`,
      swaggerUrl: `http://localhost:${port}/api`,
    },
  });
}

bootstrap();
