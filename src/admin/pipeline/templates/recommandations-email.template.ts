interface RecoEmail {
  id: string;
  titre: string;
  pays: string;
  secteurs: string;
  organisation: string;
  url: string | null;
  scorePourcentage: number;
  deadline: Date | null;
}

interface RecoEmailParams {
  prenom: string;
  nbRecos: number;
  recos: RecoEmail[];
}

export function buildRecommandationsEmail(params: RecoEmailParams): string {
  const { prenom, nbRecos, recos } = params;
  const year = new Date().getFullYear();

  // URL du frontend (configurable via .env)
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  const formatDate = (date: Date | null) =>
    date
      ? new Date(date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Non précisée';

  const renderReco = (r: RecoEmail, i: number) => {
    const detailUrl = `${frontendUrl}/app/opportunities/${r.id}`;

    return `
    <tr>
      <td style="padding:0 0 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:8px;">
                    <span style="display:inline-block;background:#f1f5f9;color:#475569;font-size:11px;padding:3px 10px;border-radius:99px;font-weight:600;">
                      ${r.scorePourcentage}% de pertinence
                    </span>
                    <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;padding:3px 10px;border-radius:99px;font-weight:600;margin-left:6px;">
                      N°${i + 1}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <a href="${detailUrl}" style="color:#0f172a;font-size:16px;font-weight:600;text-decoration:none;line-height:1.4;">
                      ${r.titre}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;font-size:13px;color:#64748b;line-height:1.6;">
                    📍 ${r.pays} &nbsp;·&nbsp; 🏢 ${r.organisation} &nbsp;·&nbsp; 🗓️ ${formatDate(r.deadline)}
                  </td>
                </tr>
                ${
                  r.secteurs
                    ? `<tr>
                         <td style="padding-bottom:14px;">
                           <span style="font-size:12px;color:#94a3b8;">🏷️ ${r.secteurs}</span>
                         </td>
                       </tr>`
                    : ''
                }
                <tr>
                  <td>
                    <a href="${detailUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;text-decoration:none;">
                      Voir l'opportunité →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nouvelles opportunités</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="padding-bottom:24px;">
              <span style="font-size:22px;font-weight:700;color:#0f172a;">🎯 Gaynaako</span>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:24px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">
                Bonjour ${prenom} 👋
              </h1>
              <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;">
                ${
                  nbRecos === 1
                    ? `Nous avons trouvé <strong>une nouvelle opportunité</strong> qui correspond à votre profil.`
                    : `Nous avons trouvé <strong>${nbRecos} nouvelles opportunités</strong> qui correspondent à votre profil.`
                }
              </p>
            </td>
          </tr>

          ${recos.map(renderReco).join('')}

          <tr>
            <td style="padding:16px 0 24px 0;text-align:center;">
              <a href="${frontendUrl}/app/dashboard" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;">
                Voir toutes mes recommandations
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                Vous recevez cet email car vous êtes inscrit sur Gaynaako.<br>
                © ${year} Gaynaako — Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
