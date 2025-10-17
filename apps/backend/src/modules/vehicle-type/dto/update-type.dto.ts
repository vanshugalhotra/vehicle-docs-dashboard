import { PartialType } from '@nestjs/swagger';
import { CreateVehicleTypeDto } from './create-type.dto';

export class UpdateVehicleTypeDto extends PartialType(CreateVehicleTypeDto) {}
