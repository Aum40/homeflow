import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { MaterialModule } from './material/material.module';
import { HouseDesignModule } from './house-design/house-design.module';
import { CompanyContactModule } from './company-contact/company-contact.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    ProjectModule,
    MaterialModule,
    HouseDesignModule,
    CompanyContactModule,
    DashboardModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
