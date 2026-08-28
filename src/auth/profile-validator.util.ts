import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { EntrepreneurProfileDto } from './dto/profiles/entrepreneur-profile.dto';
import { PmeProfileDto } from './dto/profiles/pme-profile.dto';
import { OngProfileDto } from './dto/profiles/ong-profile.dto';
import { RegisterRole } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ProfileValidator {
  constructor(private readonly prisma: PrismaService) {}

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
      secteurId?: string;
      paysId?: string;
      domaineExpertise?: string;
      objectifs?: string;
      nomEntreprise?: string;
      secteurIds?: string;
      nomOrganisation?: string;
      domaineInterventionIds?: string;
      mission?: string;
    },
    logoUrl?: string,
  ): Promise<Prisma.InputJsonObject> {
    switch (role) {
      case RegisterRole.ENTREPRENEUR: {
        const dto = await this.validateDto(EntrepreneurProfileDto, {
          secteurId: raw.secteurId,
          paysId: raw.paysId,
          domaineExpertise: raw.domaineExpertise,
          objectifs: raw.objectifs,
        });

        await this.assertExists(
          'secteur',
          [dto.secteurId as string],
          'Secteur',
        );

        await this.assertExists(
          'pays',
          [dto.paysId as string],
          'Pays',
        );

        return dto;
      }

      case RegisterRole.PME: {
        const dto = await this.validateDto(PmeProfileDto, {
          nomEntreprise: raw.nomEntreprise,
          secteurIds: this.splitList(raw.secteurIds),
          logoUrl,
        });

        await this.assertExists(
          'secteur',
          dto.secteurIds as string[],
          'Secteur',
        );

        return dto;
      }

      case RegisterRole.ONG: {
        const dto = await this.validateDto(OngProfileDto, {
          nomOrganisation: raw.nomOrganisation,
          domaineInterventionIds: this.splitList(
            raw.domaineInterventionIds,
          ),
          mission: raw.mission,
          logoUrl,
        });

        await this.assertExists(
          'domaineIntervention',
          dto.domaineInterventionIds as string[],
          "Domaine d'intervention",
        );

        return dto;
      }
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
        .flatMap((error) => Object.values(error.constraints ?? {}))
        .join(', ');

      throw new BadRequestException(`Profil invalide : ${messages}`);
    }

    return { ...instance } as Prisma.InputJsonObject;
  }

  private async assertExists(
    model: 'secteur' | 'pays' | 'domaineIntervention',
    ids: string[],
    label: string,
  ): Promise<void> {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length === 0) {
      throw new BadRequestException(`${label} invalide`);
    }

    let count: number;

    switch (model) {
      case 'secteur':
        count = await this.prisma.secteur.count({
          where: {
            id: {
              in: uniqueIds,
            },
          },
        });
        break;

      case 'pays':
        count = await this.prisma.pays.count({
          where: {
            id: {
              in: uniqueIds,
            },
          },
        });
        break;

      case 'domaineIntervention':
        count = await this.prisma.domaineIntervention.count({
          where: {
            id: {
              in: uniqueIds,
            },
          },
        });
        break;
    }

    if (count !== uniqueIds.length) {
      throw new BadRequestException(
        `${label} invalide : un ou plusieurs IDs n'existent pas`,
      );
    }
  }
}
