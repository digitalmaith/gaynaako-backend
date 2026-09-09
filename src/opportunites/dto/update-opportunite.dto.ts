import { PartialType } from '@nestjs/swagger';
import { CreateOpportuniteDto } from './create-opportunite.dto';

export class UpdateOpportuniteDto extends PartialType(CreateOpportuniteDto) {}
