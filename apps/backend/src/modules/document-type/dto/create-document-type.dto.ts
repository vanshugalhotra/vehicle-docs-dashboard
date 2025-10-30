import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateDocumentTypeDto {
  @ApiProperty({
    description: 'Unique name of the document type',
    example: 'Insurance Certificate',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9\s-]+$/, {
    message:
      'Document type name can only contain letters, numbers, spaces, and hyphens.',
  })
  @MinLength(2)
  @MaxLength(50, {
    message: 'Document type name must be at most 50 characters.',
  })
  @Trim()
  name: string;
}
