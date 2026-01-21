import { applyDecorators } from "@nestjs/common";
import { MinLength, MaxLength, Matches } from "class-validator";

export function PasswordPolicy() {
  return applyDecorators(
    MinLength(8, { message: "Password must be at least 8 characters long" }),
    MaxLength(20, { message: "Password must not exceed 20 characters" }),
    Matches(/[a-zA-Z]/, {
      message: "Password must contain at least one letter",
    }),
    Matches(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    }),
    Matches(/\d/, { message: "Password must contain at least one number" }),
  );
}
