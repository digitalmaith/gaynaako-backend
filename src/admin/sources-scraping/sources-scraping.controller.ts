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
import { SourcesScrapingService } from './sources-scraping.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { ListSourcesQueryDto } from './dto/list-sources-query.dto';
import { UpdateActifDto } from './dto/update-actif.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RoleUtilisateur } from '../../generated/prisma/enums';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';

@ApiTags('admin-sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleUtilisateur.ADMINISTRATEUR)
@Controller('admin/sources')
export class SourcesScrapingController {
  constructor(private readonly service: SourcesScrapingService) {}

  @Get()
  list(@Query() query: ListSourcesQueryDto) {
    return this.service.listSources(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getSourceById(id);
  }

  @Post()
  create(@Body() dto: CreateSourceDto, @CurrentUser() admin: JwtPayload) {
    return this.service.createSource(dto, admin.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSourceDto, @CurrentUser() admin: JwtPayload) {
    return this.service.updateSource(id, dto, admin.sub);
  }

  @Patch(':id/actif')
  updateActif(
    @Param('id') id: string,
    @Body() dto: UpdateActifDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.service.updateActif(id, dto.actif, admin.sub);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() admin: JwtPayload) {
    return this.service.deleteSource(id, admin.sub);
  }
}
