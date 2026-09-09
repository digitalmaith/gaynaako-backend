import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CandidaturesService } from './candidatures.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateStatutCandidatureDto } from './dto/update-statut-candidature.dto';
import { ListCandidaturesQueryDto } from './dto/list-candidatures-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('candidatures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidatures')
export class CandidaturesController {
  constructor(private readonly candidaturesService: CandidaturesService) {}

  @Get()
  list(@Query() query: ListCandidaturesQueryDto, @CurrentUser() currentUser: JwtPayload) {
    return this.candidaturesService.listMyCandidatures(currentUser.sub, query);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.candidaturesService.getById(id, currentUser.sub);
  }

  @Post()
  create(@Body() dto: CreateCandidatureDto, @CurrentUser() currentUser: JwtPayload) {
    return this.candidaturesService.create(currentUser.sub, dto.opportuniteId);
  }

  @Patch(':id/statut')
  updateStatut(
    @Param('id') id: string,
    @Body() dto: UpdateStatutCandidatureDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.candidaturesService.updateStatut(id, currentUser.sub, dto.statut);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.candidaturesService.delete(id, currentUser.sub);
  }
}
