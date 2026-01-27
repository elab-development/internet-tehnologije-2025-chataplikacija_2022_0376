// config/emailConfig.ts
import nodemailer from 'nodemailer';

// Konfiguracija SMTP transportera
export const transporter = nodemailer.createTransport({
  service: 'gmail', // Ili 'outlook', 'yahoo', itd.
  auth: {
    user: process.env.SMTP_EMAIL, // Tvoj email
    pass: process.env.SMTP_PASSWORD, // App password (ne obična lozinka!)
  },
});

// Provera da li je transporter konfigurisan
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ [EMAIL] SMTP server is ready to send emails');
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] SMTP configuration error:', error.message);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  // Template za reset password
  resetPassword: (resetUrl: string, userName: string) => ({
    subject: '🔐 Resetovanje lozinke - Chat App',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #111827;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 30px 0;
            border-radius: 4px;
            color: #92400e;
            font-size: 14px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
          }
          .footer a {
            color: #2563eb;
            text-decoration: none;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Resetovanje lozinke</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Zdravo, ${userName}!</div>
            
            <p class="message">
              Primili smo zahtev za resetovanje lozinke za vaš nalog. 
              Kliknite na dugme ispod da kreirate novu lozinku:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">
                Resetuj lozinku
              </a>
            </div>
            
            <div class="warning">
              ⚠️ <strong>Važno:</strong> Ovaj link ističe za <strong>1 sat</strong>. 
              Ako niste vi tražili resetovanje lozinke, možete slobodno ignorisati ovaj email.
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Ako dugme ne radi, kopirajte i nalepite sledeći link u browser:
            </p>
            <p style="word-break: break-all; color: #2563eb; font-size: 14px;">
              ${resetUrl}
            </p>
          </div>
          
          <div class="footer">
            <p>
              Ovo je automatska poruka, molimo vas da ne odgovarate na ovaj email.
            </p>
            <p>
              © ${new Date().getFullYear()} Chat App. Sva prava zadržana.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Zdravo, ${userName}!

Primili smo zahtev za resetovanje lozinke za vaš nalog.

Kliknite na sledeći link da resetujete lozinku:
${resetUrl}

VAŽNO: Ovaj link ističe za 1 sat.

Ako niste vi tražili resetovanje lozinke, možete slobodno ignorisati ovaj email.

---
Chat App
© ${new Date().getFullYear()} Sva prava zadržana.
    `,
  }),

  // Template za welcome email (opciono)
  welcome: (userName: string) => ({
    subject: '🎉 Dobrodošli u Chat App!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; color: white; }
          .content { padding: 40px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Dobrodošli!</h1>
          </div>
          <div class="content">
            <h2>Zdravo, ${userName}!</h2>
            <p>Uspešno ste kreirali nalog na Chat App platformi.</p>
            <p>Sada možete početi da ćaskate sa prijateljima, delite slike, GIF-ove i još mnogo toga!</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Chat App
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Dobrodošli u Chat App, ${userName}!`,
  }),
};