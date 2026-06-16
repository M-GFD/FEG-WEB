import crypto from "crypto";
import { Resend } from "resend";
import { getBaseUrl } from "@/lib/app-url";
import { FEG_EMAIL_LOGO_PUBLIC_PATH } from "@/lib/feegBrand";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Resend exige un remitente de un dominio verificado, o en pruebas `onboarding@resend.dev`.
 * Para buena entregabilidad (evitar spam), configurá EMAIL_FROM con un dominio verificado en Resend.
 */
function getFrom(): string {
  const explicit = process.env.EMAIL_FROM?.trim();
  if (explicit) return explicit;
  return "Federación Entreriana de Golf <onboarding@resend.dev>";
}

function getReplyTo(): string | undefined {
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  return replyTo || undefined;
}

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: "verify-email" | "reset-password";
};

function transactionalHeaders(emailType: string): Record<string, string> {
  return {
    "X-Entity-Ref-ID": `${emailType}-${crypto.randomUUID()}`,
    "X-Auto-Response-Suppress": "OOF, AutoReply",
    Precedence: "auto",
  };
}

async function sendEmail({ to, subject, html, text, emailType }: SendEmailArgs) {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false as const, error: "Falta RESEND_API_KEY en el entorno del servidor." };
  }

  const from = getFrom();
  const replyTo = getReplyTo();

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
    replyTo,
    headers: transactionalHeaders(emailType),
    tags: [
      { name: "category", value: "transactional" },
      { name: "type", value: emailType },
    ],
  });

  if (result.error) {
    const detail = result.error.message || result.error.name || "Error de Resend";
    console.error("[email] Resend:", result.error);
    return {
      ok: false as const,
      error: `No se pudo enviar el correo: ${detail}`,
    };
  }

  return { ok: true as const };
}

function emailLogoUrl(): string {
  return `${getBaseUrl()}${FEG_EMAIL_LOGO_PUBLIC_PATH}`;
}

function emailSiteUrl(): string {
  return getBaseUrl();
}

function verificationEmailContent(verifyUrl: string) {
  const logoUrl = emailLogoUrl();
  const siteUrl = emailSiteUrl();

  const passwordNotice =
    "La contraseña para la primera vez que inicia sesión debe ser provista por la FEG: es una contraseña genérica, aleatoria y de único uso. Esa contraseña debe cambiarse luego de usarla por única vez.";

  const text = [
    "Federación Entrerriana de Golf",
    "",
    "Verificación de email",
    "",
    "Para activar tu cuenta, confirmá tu email abriendo este enlace:",
    verifyUrl,
    "",
    "Importante — contraseña de primer ingreso",
    passwordNotice,
    "",
    "Si no solicitaste este correo, podés ignorar este mensaje.",
    "",
    `Federación Entrerriana de Golf — ${siteUrl}`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Verificación de email — FEG</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f6f4;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#002403;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f6f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #d8e5dc;">
          <tr>
            <td align="center" style="padding:28px 32px 12px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img
                  src="${logoUrl}"
                  alt="Federación Entrerriana de Golf"
                  width="140"
                  height="auto"
                  style="display:block;border:0;max-width:140px;height:auto;"
                />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0;">
              <h1 style="margin:0;font-size:20px;line-height:1.35;font-weight:600;color:#002403;">
                Verificación de email
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 0;font-size:15px;line-height:1.6;color:#1f3d2a;">
              <p style="margin:0 0 14px;">
                Para activar tu cuenta, confirmá tu email haciendo click en el siguiente botón:
              </p>
              <p style="margin:0 0 20px;text-align:center;">
                <a
                  href="${verifyUrl}"
                  style="display:inline-block;background-color:#146638;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;"
                >
                  Verificar email
                </a>
              </p>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#3b5a3c;">
                Si el botón no funciona, copiá y pegá este enlace en tu navegador:
              </p>
              <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#146638;word-break:break-all;">
                <a href="${verifyUrl}" style="color:#146638;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef6ef;border-radius:12px;border:1px solid #cfe0d4;">
                <tr>
                  <td style="padding:16px 18px;font-size:14px;line-height:1.55;color:#1f3d2a;">
                    <p style="margin:0 0 8px;font-weight:600;color:#002403;">
                      Importante — contraseña de primer ingreso
                    </p>
                    <p style="margin:0;">
                      ${passwordNotice}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;font-size:13px;line-height:1.5;color:#3b5a3c;">
              <p style="margin:0;">
                Si no solicitaste este correo, podés ignorar este mensaje.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;border-top:1px solid #e8efe9;font-size:12px;line-height:1.5;color:#5a7a62;text-align:center;">
              Federación Entrerriana de Golf<br />
              <a href="${siteUrl}" style="color:#146638;text-decoration:none;">${siteUrl}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}

export async function sendVerifyEmail(args: { to: string; verifyUrl: string }) {
  const { to, verifyUrl } = args;
  const subject = "Verificá tu email — Federación Entrerriana de Golf";
  const { html, text } = verificationEmailContent(verifyUrl);

  return sendEmail({ to, subject, html, text, emailType: "verify-email" });
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

  return sendEmail({ to, subject, html, text, emailType: "reset-password" });
}
