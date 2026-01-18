import { Module } from '@nestjs/common';
import { OtpAdminController } from './otp-admin.controller';
import { OtpAdminService } from './otp-admin.service';

@Module({
  controllers: [OtpAdminController],
  providers: [OtpAdminService],
  exports: [OtpAdminService],
})
export class OtpAdminModule {}
