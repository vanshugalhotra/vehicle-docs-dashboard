import { OtpPurpose } from '@prisma/client';

export class OtpResponseDto {
  id: string;
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
