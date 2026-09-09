import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateEntrepreneurProfileDto } from './dto/update-entrepreneur-profile.dto';
import { UpdatePmeProfileDto } from './dto/update-pme-profile.dto';
import { UpdateOngProfileDto } from './dto/update-ong-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import type { FastifyRequest } from 'fastify';
import { UpdateIdentityDto } from './dto/update-identity.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMyProfile(@CurrentUser() currentUser: JwtPayload) {
    return this.usersService.getMyProfile(currentUser.sub);
  }

  @Patch('entrepreneur-profile')
  updateEntrepreneurProfile(
    @Body() dto: UpdateEntrepreneurProfileDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.updateEntrepreneurProfile(currentUser.sub, currentUser.role, dto);
  }

  @Patch('pme-profile')
  updatePmeProfile(@Body() dto: UpdatePmeProfileDto, @CurrentUser() currentUser: JwtPayload) {
    return this.usersService.updatePmeProfile(currentUser.sub, currentUser.role, dto);
  }

  @Patch('ong-profile')
  updateOngProfile(@Body() dto: UpdateOngProfileDto, @CurrentUser() currentUser: JwtPayload) {
    return this.usersService.updateOngProfile(currentUser.sub, currentUser.role, dto);
  }

  @Patch('logo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { logo: { type: 'string', format: 'binary' } },
      required: ['logo'],
    },
  })
  async updateLogo(@Req() req: FastifyRequest, @CurrentUser() currentUser: JwtPayload) {
    const parts = req.parts();
    let logoFile: { buffer: Buffer; filename: string } | undefined;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'logo') {
        logoFile = { buffer: await part.toBuffer(), filename: part.filename };
      }
    }

    if (!logoFile) {
      throw new Error('Aucun fichier logo fourni');
    }

    return this.usersService.updateLogo(currentUser.sub, currentUser.role, logoFile);
  }

  @Patch('password')
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() currentUser: JwtPayload) {
    return this.usersService.changePassword(currentUser.sub, dto.currentPassword, dto.newPassword);
  }

  @Patch('identity')
  updateIdentity(@Body() dto: UpdateIdentityDto, @CurrentUser() currentUser: JwtPayload) {
    return this.usersService.updateIdentity(currentUser.sub, dto);
  }
}
