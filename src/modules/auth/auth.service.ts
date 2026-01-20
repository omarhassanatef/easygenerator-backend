import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UserRepository } from "./repositories/user.repository";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AppLogger } from "../../shared/logger/logger.service";
import { Env } from "../../shared/config/env.config";

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext("AuthService");
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn({
        message: "Registration attempt with existing email",
        method: { name: "register", phase: "Mid" },
        data: { email },
      });
      throw new ConflictException(
        "Registration failed, please contact support",
      );
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    this.logger.log({
      message: "User registered successfully",
      method: { name: "register", phase: "End" },
      data: { email, userId: user._id },
    });

    const { accessToken, refreshToken } = this.generateTokenPair(
      user._id.toString(),
      user.email,
    );

    return {
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn({
        message: "Login attempt with non-existent email",
        method: { name: "login", phase: "Mid" },
        data: { email },
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn({
        message: "Failed login attempt",
        method: { name: "login", phase: "Mid" },
        data: { email },
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    this.logger.log({
      message: "User logged in successfully",
      method: { name: "login", phase: "End" },
      data: { email, userId: user._id },
    });

    const { accessToken, refreshToken } = this.generateTokenPair(
      user._id.toString(),
      user.email,
    );

    return {
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_SECRET", { infer: true }),
      });

      const tokens = this.generateTokenPair(payload.sub, payload.email);

      this.logger.log({
        message: "Tokens refreshed successfully",
        method: { name: "refreshTokens", phase: "End" },
        data: { userId: payload.sub },
      });

      return tokens;
    } catch (error) {
      this.logger.warn({
        message: "Invalid or expired refresh token",
        method: { name: "refreshTokens", phase: "Mid" },
        error,
      });
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private generateTokenPair(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("ACCESS_TOKEN_EXPIRES_IN", {
        infer: true,
      }),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("REFRESH_TOKEN_EXPIRES_IN", {
        infer: true,
      }),
    });

    return { accessToken, refreshToken };
  }
}
