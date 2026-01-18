import { ApiProperty } from '@nestjs/swagger';
import {
  AuditAction,
  AuditEntity,
  AuditContext,
} from 'src/common/types/audit.types';

export class AuditLogResponseDto {
  @ApiProperty({ example: 'd08e8e6e-8115-4068-9ca8-0df33a5be3b5' })
  id: string;

  @ApiProperty({ enum: AuditEntity })
  entityType: AuditEntity;

  @ApiProperty({ example: '361c3fe4-3143-4daa-ab8a-911d453f3782' })
  entityId: string;

  @ApiProperty({ enum: AuditAction })
  action: AuditAction;

  @ApiProperty({
    example: 'a3ac71f2-5f3f-4d14-a00d-e0e621634473',
    required: false,
  })
  actorUserId?: string | null;

  @ApiProperty({
    example: 'Pollution for CAR (SMall) - 8765432334 was renewed',
  })
  summary: string;

  @ApiProperty({
    example: {
      event: 'vehicle_document.renewed',
      changes: {
        expiryDate: {
          from: '2025-12-01T00:00:00.000Z',
          to: '2026-01-23T00:00:00.000Z',
        },
      },
      related: {
        vehicleId: '361c3fe4-3143-4daa-ab8a-911d453f3782',
        vehicleName: 'CAR (SMall) - 8765432334',
        documentTypeId: '58229b84-3efa-4cc4-9d59-b4721349d653',
        documentTypeName: 'Pollution',
      },
      meta: { source: 'admin@example.com' },
    },
    required: false,
  })
  context?: AuditContext | null;

  @ApiProperty({ example: '2026-01-13T07:46:24.758Z' })
  createdAt: Date | string;
}

export class PaginatedAuditLogResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  items: AuditLogResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
