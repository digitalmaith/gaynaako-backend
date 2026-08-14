import 'dotenv/config';
import * as nodemailer from 'nodemailer';

async function test() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP OK');

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // envoie-toi l'email à toi-même pour tester
      subject: 'Test OTP',
      text: 'Test 123456',
      html: '<p>Test 123456</p>',
    });
    console.log('✅ Email envoyé:', info.messageId);
  } catch (err) {
    console.error('❌ Erreur:', err);
  }
}

test();
