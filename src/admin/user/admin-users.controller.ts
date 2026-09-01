// src/admin/admin-users.controller.ts
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
import { AdminUsersService } from './admin-users.service';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateUserStatutDto } from '../dto/update-user-statut.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RoleUtilisateur } from '../../generated/prisma/enums';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleUtilisateur.ADMINISTRATEUR)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminUsersService.listUsers(query);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Patch(':id/statut')
  updateStatut(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatutDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.adminUsersService.updateStatut(id, dto.statut, currentUser.sub);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.adminUsersService.deleteUser(id, currentUser.sub);
  }

  @Post(':id/restore')
  restoreUser(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.adminUsersService.restoreUser(id, currentUser.sub);
  }
}
