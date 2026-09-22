// src/abonnements/plans.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SetPlanFonctionnaliteDto } from './dto/set-plan-fonctionnalite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleUtilisateur } from '../generated/prisma/enums';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  list() {
    return this.plansService.listActifs();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.plansService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleUtilisateur.ADMINISTRATEUR)
  @ApiBearerAuth()
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleUtilisateur.ADMINISTRATEUR)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Post(':id/fonctionnalites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleUtilisateur.ADMINISTRATEUR)
  @ApiBearerAuth()
  setFonctionnalite(@Param('id') id: string, @Body() dto: SetPlanFonctionnaliteDto) {
    return this.plansService.setFonctionnalite(id, dto.cle, dto.valeur);
  }

  @Delete(':id/fonctionnalites/:cle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleUtilisateur.ADMINISTRATEUR)
  @ApiBearerAuth()
  removeFonctionnalite(@Param('id') id: string, @Param('cle') cle: string) {
    return this.plansService.removeFonctionnalite(id, cle);
  }
}
