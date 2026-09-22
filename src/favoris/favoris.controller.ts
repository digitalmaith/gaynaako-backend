import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FavorisService } from './favoris.service';
import { CreateFavoriDto } from './dto/create-favori.dto';
import { ListFavorisQueryDto } from './dto/list-favoris-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('favoris')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @Get()
  list(@Query() query: ListFavorisQueryDto, @CurrentUser() currentUser: JwtPayload) {
    return this.favorisService.listMyFavoris(currentUser.sub, query);
  }

  @Post()
  add(@Body() dto: CreateFavoriDto, @CurrentUser() currentUser: JwtPayload) {
    return this.favorisService.add(currentUser.sub, dto.opportuniteId);
  }

  @Delete(':opportuniteId')
  remove(@Param('opportuniteId') opportuniteId: string, @CurrentUser() currentUser: JwtPayload) {
    return this.favorisService.remove(currentUser.sub, opportuniteId);
  }
}
