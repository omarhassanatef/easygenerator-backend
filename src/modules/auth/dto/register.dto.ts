import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PasswordPolicy } from "@shared/decorators/password-policy.decorator";

export class RegisterDto {
  @ApiProperty({
    example: "omar hassan",
    description: "The name of the user",
  })
  @IsString()
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "omar.hassan@example.com",
    description: "The email address of the user",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "SecurePassword123!",
    description: "Password must meet complexity requirements (8-20 chars, uppercase, number, letter)",
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @PasswordPolicy()
  @IsNotEmpty()
  password: string;
}
