import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "./repositories/user.repository";
import { User, UserSchema } from "./schemas/user.schema";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Env } from "../../shared/config/env.config";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env, true>) => ({
        secret: configService.get("JWT_SECRET", { infer: true }),
        signOptions: {
          expiresIn: configService.get("ACCESS_TOKEN_EXPIRES_IN", {
            infer: true,
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
