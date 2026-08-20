import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Prisma } from '../generated/prisma/client';

import { EntrepreneurProfileDto } from './dto/profiles/entrepreneur-profile.dto';
import { PmeProfileDto } from './dto/profiles/pme-profile.dto';
import { OngProfileDto } from './dto/profiles/ong-profile.dto';
import { RegisterRole } from './dto/register.dto';

@Injectable()
export class ProfileValidator {
  private splitList(value?: string): string[] {
    if (!value) return [];

    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  async validateAndBuild(
    role: RegisterRole,
    raw: {
      secteurActivite?: string;
      pays?: string;
      domaineExpertise?: string;
      objectifs?: string;
      nomEntreprise?: string;
      secteursActivite?: string;
      nomOrganisation?: string;
      domainesIntervention?: string;
      mission?: string;
    },
    logoUrl?: string,
  ): Promise<Prisma.InputJsonObject> {
    switch (role) {
      case RegisterRole.ENTREPRENEUR:
        return this.validateDto(EntrepreneurProfileDto, {
          secteurActivite: raw.secteurActivite,
          pays: raw.pays,
          domaineExpertise: raw.domaineExpertise,
          objectifs: raw.objectifs,
        });

      case RegisterRole.PME:
        return this.validateDto(PmeProfileDto, {
          nomEntreprise: raw.nomEntreprise,
          secteursActivite: this.splitList(raw.secteursActivite),
          logoUrl,
        });

      case RegisterRole.ONG:
        return this.validateDto(OngProfileDto, {
          nomOrganisation: raw.nomOrganisation,
          domainesIntervention: this.splitList(raw.domainesIntervention),
          mission: raw.mission,
          logoUrl,
        });
    }
  }

  private async validateDto<T extends object>(
    cls: new () => T,
    plain: Record<string, unknown>,
  ): Promise<Prisma.InputJsonObject> {
    const instance = plainToInstance(cls, plain);

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .flatMap((e) => Object.values(e.constraints ?? {}))
        .join(', ');

      throw new BadRequestException(`Profil invalide : ${messages}`);
    }

    return instance as Prisma.InputJsonObject;
  }
}
