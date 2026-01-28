import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { NoEmoji } from 'src/common/decorators/noemoji.decorator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateDocumentTypeDto {
  @ApiProperty({
    description: 'Unique name of the document type',
    example: 'Insurance Certificate',
  })
  @IsString()
  @IsNotEmpty()
  @NoEmoji()
  @MinLength(2)
  @MaxLength(50, {
    message: 'Document type name must be at most 50 characters.',
  })
  @Trim()
  name: string;
}
