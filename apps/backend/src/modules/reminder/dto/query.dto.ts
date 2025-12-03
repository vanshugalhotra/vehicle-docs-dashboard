import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class TriggerReminderDto {
  @ApiProperty({
    description: 'triggered by: ',
    example: 'Manual: api',
    required: false,
  })
  @IsOptional()
  @IsString()
  triggeredBy?: string;
  @ApiProperty({
    description: 'preface text',
    example: 'manual trigger',
    required: false,
  })
  @IsOptional()
  @IsString()
  preface?: string;
}

export class GetQueueItemsDto {
  @ApiProperty({
    description: 'Status of queue items',
    enum: ['pending', 'sent', 'failed', 'all'],
    default: 'pending',
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'sent', 'failed', 'all'])
  status?: 'pending' | 'sent' | 'failed' | 'all';

  @ApiProperty({
    description: 'Start date (ISO string)',
    example: '2025-12-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'End date (ISO string)',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Filter by reminder config ID',
    example: '2fad6f7a-cb31-4dac-b34f-b9096066a9ef',
    required: false,
  })
  @IsOptional()
  @IsString()
  configId?: string;

  @ApiProperty({
    description: 'Include failed items when status is "all"',
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  includeFailed?: boolean;
}
