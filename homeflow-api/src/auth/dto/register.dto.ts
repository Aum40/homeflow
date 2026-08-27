import { Match } from '@/common/decorators/match.decorator';
import { Trim } from '@/common/decorators/trim.decorator';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength
} from 'class-validator';
import { trim } from 'zod';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  nickName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

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
