import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFrom(): string {
  return process.env.EMAIL_FROM || "FEG <no-reply@fegolf.ar>";
}

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

async function sendEmail({ to, subject, html, text }: SendEmailArgs) {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false as const, error: "Falta RESEND_API_KEY" };
  }

  const from = getFrom();

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  if ((result as { error?: unknown }).error) {
    return { ok: false as const, error: "No se pudo enviar el email" };
  }

  return { ok: true as const };
}

export async function sendVerifyEmail(args: { to: string; verifyUrl: string }) {
  const { to, verifyUrl } = args;
  const subject = "Verificá tu email — FEG";
  const text = `Verificá tu email para activar tu cuenta: ${verifyUrl}`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.55;">
      <h2 style="margin:0 0 12px; font-size:18px;">Verificación de email</h2>
      <p style="margin:0 0 14px;">Para activar tu cuenta, confirmá tu email haciendo click en el siguiente enlace:</p>
      <p style="margin:0 0 18px;">
        <a href="${verifyUrl}" style="display:inline-block; background:#002403; color:white; padding:10px 14px; border-radius:999px; text-decoration:none; font-weight:600;">
          Verificar email
        </a>
      </p>
      <p style="margin:0; color:#3b5a3c; font-size:13px;">Si no solicitaste esto, podés ignorar este mensaje.</p>
    </div>
  `;

  return sendEmail({ to, subject, html, text });
}

export async function sendResetPasswordEmail(args: { to: string; resetUrl: string }) {
  const { to, resetUrl } = args;
  const subject = "Restablecer contraseña — FEG";
  const text = `Para restablecer tu contraseña, abrí este enlace: ${resetUrl}`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.55;">
      <h2 style="margin:0 0 12px; font-size:18px;">Restablecer contraseña</h2>
      <p style="margin:0 0 14px;">Recibimos un pedido para restablecer tu contraseña. Usá el siguiente enlace:</p>
      <p style="margin:0 0 18px;">
        <a href="${resetUrl}" style="display:inline-block; background:#002403; color:white; padding:10px 14px; border-radius:999px; text-decoration:none; font-weight:600;">
          Crear nueva contraseña
        </a>
      </p>
      <p style="margin:0; color:#3b5a3c; font-size:13px;">Si no solicitaste esto, podés ignorar este mensaje.</p>
    </div>
  `;

  return sendEmail({ to, subject, html, text });
}

