import { PartialType } from '@nestjs/swagger';
import { CreateEmetteurDto } from './create-emetteur.dto';

export class UpdateEmetteurDto extends PartialType(CreateEmetteurDto) {}
