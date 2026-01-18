import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from './user/user.service';
import { EmailService } from 'src/email/email.service';
import { OtpService } from './otp/otp.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, EmailService, OtpService, AuditService],
  exports: [AuthService],
})
export class AuthModule {}
