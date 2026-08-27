import { Match } from '@/common/decorators/match.decorator';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/, {
    message:
      'password must contain at least one lowercase letter, one uppercase letter, and one symbol'
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Match('password', { message: 'confirmPassword must match password' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
