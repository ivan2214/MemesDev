import { render } from "@react-email/render";
import { transporter } from "@/config/mail.config";
import MagicLinkEmail from "@/emails/magic-link-email";
import { env } from "@/env/server";

interface BaseEmailParams {
  to: string;
  userFirstname?: string;
}

interface MagicLinkEmailParams extends BaseEmailParams {
  type: "magic-link";
  magicLinkUrl: string;
  expiresIn?: string;
}

const APP_NAME = "Memes Dev";
const LOGO_URL = "https://memes-dev-prod.t3.storage.dev/logo.webp";

const subjectMap = {
  "magic-link": `${APP_NAME} - Enlace de inicio de sesión`,
};

export async function sendEmail(params: MagicLinkEmailParams) {
  const html = await render(
    MagicLinkEmail({
      appName: APP_NAME,
      logoUrl: LOGO_URL,
      magicLinkUrl: params.magicLinkUrl,
      expiresIn: params.expiresIn,
    }),
  );

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: subjectMap[params.type],
    html,
  });
}
