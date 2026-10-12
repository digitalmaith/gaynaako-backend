import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { buildRecommandationsEmail } from './templates/recommandations-email.template';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private readonly MIN_SCORE = Number(process.env.PIPELINE_MIN_SCORE ?? '0.70');
  private readonly REQUIRE_ACTIVE_SUB = process.env.NOTIFY_REQUIRE_ACTIVE_SUBSCRIPTION === 'true';

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Notifie les nouvelles recommandations ≥ MIN_SCORE aux users actifs.
   * Retourne un compte-rendu.
   */
  async notifyNewRecommendations(): Promise<{
    usersNotifies: number;
    recosNotifiees: number;
    skipped: number;
  }> {
    this.logger.log(
      `📧 Recherche des recos à notifier (seuil: ${this.MIN_SCORE * 100}%, ` +
        `filtre abonnement: ${this.REQUIRE_ACTIVE_SUB})`,
    );

    const recosParUser = await this.getRecosByUser();

    if (recosParUser.size === 0) {
      this.logger.log('⏭️  Aucune nouvelle reco à notifier');
      return { usersNotifies: 0, recosNotifiees: 0, skipped: 0 };
    }

    const users = await this.prisma.utilisateur.findMany({
      where: { id: { in: [...recosParUser.keys()] } },
      select: { id: true, email: true, prenom: true, nom: true },
    });

    let usersNotifies = 0;
    const notifiedIds: string[] = [];

    for (const user of users) {
      const recos = recosParUser.get(user.id) ?? [];
      if (recos.length === 0) continue;

      try {
        const html = buildRecommandationsEmail({
          prenom: user.prenom || user.nom || 'Utilisateur',
          nbRecos: recos.length,
          recos: recos.map((r) => ({
            titre: r.opportunite.titre,
            pays: r.opportunite.pays ?? 'Non précisé',
            secteurs: r.opportunite.secteurs ?? '',
            organisation: r.opportunite.organisation ?? 'Source inconnue',
            url: r.opportunite.url,
            scorePourcentage: Math.round(r.scorePertinence * 100),
            deadline: r.opportunite.deadline,
          })),
        });

        await this.mailService.sendHtml({
          to: user.email,
          subject: `🎯 ${recos.length} nouvelle(s) opportunité(s) pour vous`,
          html,
        });

        notifiedIds.push(...recos.map((r) => r.id));
        usersNotifies++;

        this.logger.log(`   ✅ Mail envoyé à ${user.email} (${recos.length} recos)`);
      } catch (err) {
        this.logger.error(`   ❌ Échec mail pour ${user.email}: ${(err as Error).message}`);
      }
    }

    if (notifiedIds.length > 0) {
      await this.prisma.recommandation.updateMany({
        where: { id: { in: notifiedIds } },
        data: {
          notifiee: true,
          dateNotification: new Date(),
        },
      });
      this.logger.log(`📝 ${notifiedIds.length} reco(s) marquée(s) comme notifiée(s)`);
    }

    return {
      usersNotifies,
      recosNotifiees: notifiedIds.length,
      skipped: recosParUser.size - usersNotifies,
    };
  }

  /**
   * Regroupe les recommandations non notifiées par utilisateur.
   */
  private async getRecosByUser() {
    const recos = await this.prisma.recommandation.findMany({
      where: {
        notifiee: false,
        scorePertinence: { gte: this.MIN_SCORE },
        utilisateur: {
          statut: 'ACTIF',
          role: { in: ['ENTREPRENEUR', 'PME', 'ONG'] },
          ...(this.REQUIRE_ACTIVE_SUB
            ? {
                abonnements: {
                  some: {
                    statut: 'ACTIF',
                    dateFin: { gt: new Date() },
                  },
                },
              }
            : {}),
        },
      },
      include: {
        opportunityProcessed: {
          select: {
            title: true,
            country: true,
            sectors: true,
            organization: true,
            url: true,
            deadline: true,
          },
        },
      },
      orderBy: { scorePertinence: 'desc' },
    });

    const map = new Map<
      string,
      Array<{
        id: string;
        scorePertinence: number;
        opportunite: {
          titre: string;
          pays: string | null;
          secteurs: string | null;
          organisation: string | null;
          url: string | null;
          deadline: Date | null;
        };
      }>
    >();

    for (const r of recos) {
      if (!map.has(r.utilisateurId)) map.set(r.utilisateurId, []);
      map.get(r.utilisateurId)!.push({
        id: r.id,
        scorePertinence: r.scorePertinence,
        opportunite: {
          titre: r.opportunityProcessed.title,
          pays: r.opportunityProcessed.country,
          secteurs: r.opportunityProcessed.sectors,
          organisation: r.opportunityProcessed.organization,
          url: r.opportunityProcessed.url,
          deadline: r.opportunityProcessed.deadline,
        },
      });
    }

    return map;
  }
}
