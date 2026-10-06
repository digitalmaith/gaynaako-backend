import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrigineOpportunite, TypeOpportunite } from '../../generated/prisma/enums';

export interface ListOpportunitesFilters {
  type?: TypeOpportunite;
  origine?: OrigineOpportunite;
  secteurId?: string;
  pays?: string;
  search?: string;
  inclureExpirees?: boolean;
  inclureSupprimes?: boolean;
  skip: number;
  take: number;
}

export interface UpsertOpportuniteData {
  titre: string;
  description: string;
  type: TypeOpportunite;
  pays: string;
  dateLimite: Date;
  criteresEligibilite?: string;
  secteurId: string;
  emetteurId?: string;
  administrateurId?: string;
  origine: OrigineOpportunite;
  externalId?: string;
}

@Injectable()
export class OpportuniteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère une opportunité non supprimée.
   */
  findById(id: string) {
    return this.prisma.opportunite.findFirst({
      where: {
        id,
        supprimeLe: null,
      },
      include: {
        secteur: true,
        emetteur: true,
      },
    });
  }

  /**
   * Récupère une opportunité même si elle est supprimée.
   */
  findByIdIncludingDeleted(id: string) {
    return this.prisma.opportunite.findUnique({
      where: { id },
      include: {
        secteur: true,
        emetteur: true,
      },
    });
  }

  /**
   * Recherche une opportunité par son identifiant externe.
   */
  findByExternalId(externalId: string) {
    return this.prisma.opportunite.findUnique({
      where: { externalId },
    });
  }

  /**
   * Construction des filtres Prisma.
   */
  private buildWhere(
    filters: Pick<
      ListOpportunitesFilters,
      'type' | 'origine' | 'secteurId' | 'pays' | 'search' | 'inclureSupprimes' | 'inclureExpirees'
    >,
  ) {
    return {
      ...(filters.inclureSupprimes
        ? {}
        : {
            supprimeLe: null,
          }),

      ...(filters.inclureExpirees
        ? {}
        : {
            dateLimite: {
              gte: new Date(),
            },
          }),

      ...(filters.type
        ? {
            type: filters.type,
          }
        : {}),

      ...(filters.origine
        ? {
            origine: filters.origine,
          }
        : {}),

      ...(filters.secteurId
        ? {
            secteurId: filters.secteurId,
          }
        : {}),

      ...(filters.pays
        ? {
            pays: {
              contains: filters.pays,
              mode: 'insensitive' as const,
            },
          }
        : {}),

      ...(filters.search
        ? {
            OR: [
              {
                titre: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
  }

  /**
   * Liste paginée des opportunités.
   */
  async findManyPaginated(filters: ListOpportunitesFilters) {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.opportunite.findMany({
        where,
        include: {
          secteur: true,
          emetteur: true,
        },
        orderBy: {
          dateCreation: 'desc',
        },
        skip: filters.skip,
        take: filters.take,
      }),

      this.prisma.opportunite.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  }

  /**
   * Création d'une opportunité.
   *
   * Les champs optionnels ne sont envoyés à Prisma
   * que lorsqu'ils existent réellement.
   */
  create(data: UpsertOpportuniteData) {
    return this.prisma.opportunite.create({
      data: {
        titre: data.titre,
        description: data.description,
        type: data.type,
        pays: data.pays,
        dateLimite: data.dateLimite,
        secteurId: data.secteurId,
        origine: data.origine,

        ...(data.criteresEligibilite !== undefined && {
          criteresEligibilite: data.criteresEligibilite,
        }),

        ...(data.emetteurId !== undefined && {
          emetteurId: data.emetteurId,
        }),

        ...(data.administrateurId !== undefined && {
          administrateurId: data.administrateurId,
        }),

        ...(data.externalId !== undefined && {
          externalId: data.externalId,
        }),
      },
    });
  }

  /**
   * Mise à jour partielle d'une opportunité.
   */
  update(id: string, data: Partial<UpsertOpportuniteData>) {
    return this.prisma.opportunite.update({
      where: { id },
      data: {
        ...(data.titre !== undefined && {
          titre: data.titre,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.type !== undefined && {
          type: data.type,
        }),

        ...(data.pays !== undefined && {
          pays: data.pays,
        }),

        ...(data.dateLimite !== undefined && {
          dateLimite: data.dateLimite,
        }),

        ...(data.criteresEligibilite !== undefined && {
          criteresEligibilite: data.criteresEligibilite,
        }),

        ...(data.secteurId !== undefined && {
          secteurId: data.secteurId,
        }),

        ...(data.emetteurId !== undefined && {
          emetteurId: data.emetteurId,
        }),

        ...(data.administrateurId !== undefined && {
          administrateurId: data.administrateurId,
        }),

        ...(data.origine !== undefined && {
          origine: data.origine,
        }),

        ...(data.externalId !== undefined && {
          externalId: data.externalId,
        }),
      },
    });
  }

  /**
   * Suppression logique.
   */
  softDelete(id: string) {
    return this.prisma.opportunite.update({
      where: { id },
      data: {
        supprimeLe: new Date(),
      },
    });
  }

  /**
   * Restauration d'une opportunité supprimée.
   */
  restore(id: string) {
    return this.prisma.opportunite.update({
      where: { id },
      data: {
        supprimeLe: null,
      },
    });
  }

  /**
   * Nombre d'opportunités actives d'un émetteur.
   */
  countByEmetteur(emetteurId: string) {
    return this.prisma.opportunite.count({
      where: {
        emetteurId,
        supprimeLe: null,
      },
    });
  }
}
