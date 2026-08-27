import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '@/user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { AccessTokenService } from './access-token.service';
import { UserResponseDto } from '@/user/dto/user-response.dto';
import { PrismaService } from '@/database/prisma.service';
import { PasswordResetToken } from '@/database/generated/prisma/client';
import { MailService } from '@/infrastructure/mail/mail.service';
import { EnvVariable } from '@/config/env.validation';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
// Floor the response time of forgotPassword regardless of branch taken, so an
// attacker can't infer whether an email is registered from response latency.
const FORGOT_PASSWORD_MIN_DURATION_MS = 200;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly accessTokenService: AccessTokenService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<EnvVariable, true>
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    const { confirmPassword, ...userInput } = dto;
    await this.userService.createUser(userInput);
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.getUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await this.bcryptService.compare(
      dto.password,
      user.password
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    const access_token = await this.accessTokenService.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    const { password, ...rest } = user;

    return { access_token, user: rest };
  }

  async getMe(id: string): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const startedAt = Date.now();

    const user = await this.userService.getUserByEmail(dto.email);
    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
        }
      });

      const frontendUrl = this.configService.get('FRONTEND_URL', {
        infer: true
      });
      // Fire-and-forget: sending mail over SMTP is slow and highly variable,
      // so it must not sit on the response path (see min-duration floor below).
      this.mailService
        .sendPasswordResetEmail(
          user.email,
          `${frontendUrl}/reset-password?token=${rawToken}`
        )
        .catch((error) => this.logger.error(error));
    }
    // Always resolves normally regardless of whether the user exists — no enumeration.

    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs < FORGOT_PASSWORD_MIN_DURATION_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, FORGOT_PASSWORD_MIN_DURATION_MS - elapsedMs)
      );
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });
    if (!this.isResetTokenValid(record)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hash = await this.bcryptService.hash(dto.password);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { password: hash }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() }
      })
    ]);
  }

  async verifyResetToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    return this.isResetTokenValid(record);
  }

  private isResetTokenValid(
    record: PasswordResetToken | null
  ): record is PasswordResetToken {
    return !!record && !record.usedAt && record.expiresAt > new Date();
  }
}
