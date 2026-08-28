import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL est introuvable dans le fichier .env');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

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

  console.log('✅ Référentiels peuplés (pays, secteurs, domaines).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
