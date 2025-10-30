import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-vehicle-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
