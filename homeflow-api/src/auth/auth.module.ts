import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@/user/user.module';
import { AccessTokenService } from './access-token.service';
import { JwtModule } from '@/infrastructure/jwt/jwt.module';
import { HashModule } from '@/infrastructure/hash/hash.module';
import { MailModule } from '@/infrastructure/mail/mail.module';

@Module({
  imports: [UserModule, JwtModule, HashModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenService],
  exports: [AccessTokenService]
})
export class AuthModule {}
