import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from '@/user/dto/user-response.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetTokenResponseDto } from './dto/verify-reset-token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto
  ): Promise<MessageResponseDto> {
    await this.authService.register(registerDto);
    return { message: 'Registered successfully' };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Get('me')
  async getMe(@CurrentUser('sub') id: string): Promise<UserResponseDto> {
    return this.authService.getMe(id);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto
  ): Promise<MessageResponseDto> {
    await this.authService.forgotPassword(dto);
    return { message: 'If that email exists, a reset link has been sent' };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto
  ): Promise<MessageResponseDto> {
    await this.authService.resetPassword(dto);
    return { message: 'Password has been reset successfully' };
  }

  @Public()
  @Get('verify-reset-token')
  async verifyResetToken(
    @Query('token') token: string
  ): Promise<VerifyResetTokenResponseDto> {
    const valid = await this.authService.verifyResetToken(token);
    return { valid };
  }
}
