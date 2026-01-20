import { Request } from "express";
import { CurrentUserData } from "../modules/auth/decorators/current-user.decorator";

export interface AuthorizedRequest extends Request {
  user: CurrentUserData;
}
