import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuditService } from 'src/modules/audit/audit.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AuditService],
  exports: [UserService],
})
export class UserModule {}
