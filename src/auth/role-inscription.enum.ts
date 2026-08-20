// Role utilisable pour l'inscription publique.
// ADMINISTRATEUR est volontairement exclu : les comptes admin
// sont crees par un autre admin ou seedes, jamais via /auth/register.
export enum RoleInscriptionPublique {
  ENTREPRENEUR = 'ENTREPRENEUR',
  PME = 'PME',
  ONG = 'ONG',
}
