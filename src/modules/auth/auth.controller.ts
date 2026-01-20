import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Auth } from "./decorators/auth.decorator";
import {
  CurrentUser,
  CurrentUserData,
} from "./decorators/current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User successfully registered",
  })
  @ApiResponse({
    status: 409,
    description: "User with this email already exists",
  })
  async register(@Body() registerDto: RegisterDto, @Res() response: Response) {
    const result = await this.authService.register(registerDto);
    return response.json({
      message: result.message,
      user: result.user,
    });
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: 200,
    description: "User successfully logged in",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const result = await this.authService.login(loginDto);

    response.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      signed: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return response.json({
      message: result.message,
      user: result.user,
    });
  }

  @Get("me")
  @Auth()
  @ApiOperation({ summary: "Get current user information" })
  @ApiResponse({
    status: 200,
    description: "Current user information",
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Omar Hassan" },
        email: { type: "string", example: "omar.hassan@easygenerator.com" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  async getCurrentUser(@CurrentUser() user: CurrentUserData) {
    return {
      name: user.name,
      email: user.email,
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiResponse({
    status: 200,
    description: "Tokens refreshed successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid or expired refresh token",
  })
  async refresh(@Req() request: Request, @Res() response: Response) {
    const refreshToken = request.signedCookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token found");
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    response.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      signed: true,
      maxAge: 15 * 60 * 1000,
    });

    response.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.json({
      message: "Tokens refreshed successfully",
    });
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout and clear authentication cookies" })
  @ApiResponse({
    status: 200,
    description: "Logged out successfully",
  })
  async logout(@Res() response: Response) {
    response.clearCookie("access_token");
    response.clearCookie("refresh_token");

    return response.json({
      message: "Logged out successfully",
    });
  }
}
