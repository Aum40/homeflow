import { Match } from '@/common/decorators/match.decorator';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/, {
    message:
      'newPassword must contain at least one lowercase letter, one uppercase letter, and one symbol'
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @Match('newPassword', {
    message: 'confirmNewPassword must match newPassword'
  })
  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
