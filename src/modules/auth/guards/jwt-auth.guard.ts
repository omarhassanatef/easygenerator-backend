import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../repositories/user.repository";
import { AuthorizedRequest } from "../../../types/AuthorizedRequest";
import { Env } from "../../../shared/config/env.config";
import { setContext, getContext } from "../../../shared/contexts/app.context";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const token = request.signedCookies?.access_token;

    if (!token) {
      throw new UnauthorizedException("No authentication token found");
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("JWT_SECRET", { infer: true }),
      });

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      request.user = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      };

      const currentContext = getContext();
      setContext({
        ...currentContext,
        userId: user._id.toString(),
      });

      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
