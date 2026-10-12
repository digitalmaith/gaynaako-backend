import 'dotenv/config';

import {
  PrismaClient,
  RoleUtilisateur,
  StatutUtilisateur,
  TypeSourceScraping,
} from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL est introuvable dans le fichier .env');
}

const adapter = new PrismaMariaDb(databaseUrl);

const prisma = new PrismaClient({ adapter });

const PAYS = [
  { nom: 'Sénégal', code: 'SN' },
  { nom: "Côte d'Ivoire", code: 'CI' },
  { nom: 'Mali', code: 'ML' },
  { nom: 'Burkina Faso', code: 'BF' },
  { nom: 'Guinée', code: 'GN' },
  { nom: 'Bénin', code: 'BJ' },
  { nom: 'Togo', code: 'TG' },
  { nom: 'Niger', code: 'NE' },
  { nom: 'Mauritanie', code: 'MR' },
  { nom: 'Cameroun', code: 'CM' },
  { nom: 'Gabon', code: 'GA' },
  { nom: 'République Démocratique du Congo', code: 'CD' },
  { nom: 'Rwanda', code: 'RW' },
  { nom: 'Madagascar', code: 'MG' },
  { nom: 'Maroc', code: 'MA' },
  { nom: 'Tunisie', code: 'TN' },
  { nom: 'Algérie', code: 'DZ' },
  { nom: 'France', code: 'FR' },
  { nom: 'Belgique', code: 'BE' },
  { nom: 'Canada', code: 'CA' },
];

const SECTEURS = [
  'Agro-alimentaire',
  "Technologies de l'information",
  'Textile & Mode',
  'Commerce & Distribution',
  'BTP & Construction',
  'Finance & Assurance',
  'Énergie',
  'Tourisme & Hôtellerie',
  'Agriculture',
  'Industrie & Manufacture',
  'Transport & Logistique',
  'Éducation & Formation',
  'Santé',
  'Artisanat',
];

const DOMAINES_INTERVENTION = [
  'Santé',
  'Éducation',
  'Environnement & Climat',
  'Droits humains',
  'Égalité de genre',
  'Sécurité alimentaire',
  'Eau & Assainissement',
  'Gouvernance & Démocratie',
  "Protection de l'enfance",
  'Développement économique local',
  "Aide humanitaire d'urgence",
];

interface SourceSeed {
  nom: string;
  url: string;
  type: TypeSourceScraping;
  selectors: Record<string, string>;
  pagination: Record<string, string | number>;
  rateLimitMs: number;
}

/**
 * Sources de scraping pré-remplies.
 * L'admin peut ensuite les gérer via l'API admin (activer/désactiver/modifier).
 */
const SOURCES_SCRAPING: SourceSeed[] = [
  {
    nom: 'DER Sénégal',
    url: 'https://der.sn/',
    type: TypeSourceScraping.html,
    selectors: {
      container: 'article, .post, .opportunity',
      title: 'h2, h3, .entry-title',
      description: '.entry-content, p',
      link: 'a',
      date: '.date, time',
    },
    pagination: {
      max_pages: 5,
      next_selector: 'a.next, a[rel="next"], .pagination .next a',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'ARCOP (ex-ARMP) Sénégal',
    url: 'http://arcop.sn',
    type: TypeSourceScraping.html,
    selectors: {
      container: 'table tr, .tender-item, article, .avis-item',
      title: 'td:first-child, .title, h3, h2',
      description: 'td:nth-child(2), .description, p',
      link: 'a',
      date: 'td:last-child, .date',
    },
    pagination: {
      max_pages: 10,
      next_selector: 'a.next, .pagination a[rel="next"], li.suivant a',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'ADEPME',
    url: 'https://www.adepme.sn/',
    type: TypeSourceScraping.html,
    selectors: {
      container: 'div',
      title: 'h3, h2',
      description: 'p',
      link: 'a',
      date: 'span, .date',
    },
    pagination: {
      max_pages: 3,
      next_selector: 'a.next, a[rel="next"], .pagination .next a',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'Banque Mondiale',
    url: 'https://projects.worldbank.org/en/projects-operations/procurement',
    type: TypeSourceScraping.puppeteer,
    selectors: {
      container: 'div[class*="card"], div[class*="item"], tr',
      title: 'h3, h4, .title, td:first-child',
      description: 'p, .description, td:nth-child(2)',
      link: 'a',
      date: '.date, time, td:last-child',
    },
    pagination: {
      max_pages: 5,
      next_selector: 'button[aria-label="Next"], a.next-page, li.next a',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'BAD - Banque Africaine de Développement',
    url: 'https://www.afdb.org/en/projects-and-operations/procurement/open-procurement-opportunities',
    type: TypeSourceScraping.puppeteer,
    selectors: {
      container: 'tr, div[class*="views-row"], div[class*="procurement"]',
      title: 'td:first-child, h3, h4, .field-content',
      description: 'td:nth-child(2), p, .description',
      link: 'a',
      date: 'td:last-child, .date, .field-content',
    },
    pagination: {
      max_pages: 5,
      next_selector: 'a[title="Go to next page"], li.pager__item--next a, a.next',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'Union Européenne',
    url: 'https://ec.europa.eu/international-partnerships/funding-and-tenders_en',
    type: TypeSourceScraping.html,
    selectors: {
      container: '.call-item, article, .funding-item',
      title: '.title, h3, h2',
      description: '.description, p',
      link: 'a',
      date: '.deadline, .date',
    },
    pagination: {
      max_pages: 5,
      next_selector: 'a[rel="next"], .pager__item--next a, li.next a',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'PNUD Sénégal',
    url: 'https://www.sn.undp.org/',
    type: TypeSourceScraping.puppeteer,
    selectors: {
      container: 'article, div[class*="card"], div[class*="item"]',
      title: 'h2, h3, h4, .title',
      description: 'p, .description, .excerpt',
      link: 'a',
      date: 'time, .date, span[class*="date"]',
    },
    pagination: {
      max_pages: 3,
      next_selector: 'a.next, a[rel="next"], [class*="next"]',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'GIZ Sénégal',
    url: 'https://www.giz.de/en/worldwide/391.html',
    type: TypeSourceScraping.html,
    selectors: {
      container: 'article, .project',
      title: 'h2, h3',
      description: 'p, .description',
      link: 'a',
      date: '.date',
    },
    pagination: {
      max_pages: 3,
      next_selector: 'a.next, a[rel="next"], .pager-next a',
    },
    rateLimitMs: 3000,
  },
  {
    nom: 'USAID',
    url: 'https://sn.usembassy.gov/business-opportunities/',
    type: TypeSourceScraping.puppeteer,
    selectors: {
      container: 'article, .opportunity, .item, div[class*="content"], .entry',
      title: 'h2, h3, h4, .title, .entry-title',
      description: '.description, p, .summary, .entry-content',
      link: 'a',
      date: '.date, time, .datetime, .published',
    },
    pagination: {
      max_pages: 3,
      next_selector: 'a.next, a[rel="next"], .nav-links .next',
    },
    rateLimitMs: 3000,
  },
];

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@gaynaako.test';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

async function seedAdmin() {
  const motDePasseHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.utilisateur.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      motDePasse: motDePasseHash,
      nom: 'Admin',
      prenom: 'Gaynaako',
      role: RoleUtilisateur.ADMINISTRATEUR,
      statut: StatutUtilisateur.ACTIF,
      administrateur: {
        create: {
          niveauAcces: 'SUPER_ADMIN',
        },
      },
    },
    update: {},
    include: { administrateur: true },
  });

  console.log(`✅ Administrateur de test prêt : ${admin.email} / ${ADMIN_PASSWORD}`);
}

/**
 * 🌱 Seed des sources de scraping.
 * Idempotent : crée la source si elle n'existe pas (par nom OU url),
 * sinon met à jour sélecteurs, pagination, rate limit et type
 * sans toucher aux flags admin (actif, dernierScan, etc.).
 */
async function seedSourcesScraping() {
  const resultats = await Promise.all(
    SOURCES_SCRAPING.map(async (source) => {
      const existing = await prisma.sourceScraping.findFirst({
        where: {
          OR: [{ nom: source.nom }, { url: source.url }],
        },
      });

      if (existing) {
        await prisma.sourceScraping.update({
          where: { id: existing.id },
          data: {
            selectors: source.selectors,
            pagination: source.pagination,
            rateLimitMs: source.rateLimitMs,
            type: source.type,
          },
        });
        return 'updated' as const;
      }

      await prisma.sourceScraping.create({
        data: {
          nom: source.nom,
          url: source.url,
          type: source.type,
          actif: true,
          selectors: source.selectors,
          pagination: source.pagination,
          rateLimitMs: source.rateLimitMs,
        },
      });
      return 'created' as const;
    }),
  );

  const created = resultats.filter((r) => r === 'created').length;
  const updated = resultats.length - created;

  console.log(`✅ Sources de scraping : ${created} créée(s), ${updated} mise(s) à jour`);
}

async function main() {
  await Promise.all(
    PAYS.map((p) =>
      prisma.pays.upsert({
        where: { nom: p.nom },
        create: p,
        update: {},
      }),
    ),
  );

  await Promise.all(
    SECTEURS.map((nom) =>
      prisma.secteur.upsert({
        where: { nom },
        create: { nom },
        update: {},
      }),
    ),
  );

  await Promise.all(
    DOMAINES_INTERVENTION.map((nom) =>
      prisma.domaineIntervention.upsert({
        where: { nom },
        create: { nom },
        update: {},
      }),
    ),
  );

  await seedAdmin();
  await seedSourcesScraping();

  console.log('✅ Référentiels peuplés (pays, secteurs, domaines, sources).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
