import { render } from "@react-email/components";
import { transporter } from "@/config/mail.config";
import { env } from "@/env/server";
import MagicLinkEmail from "./email-templates/magic-link-email";

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
const LOGO_URL =
  "https://imgs.search.brave.com/z5-PYgqXAaQOoTCqgYu_e1jF5m_6xufn95YZndUGtAM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL1Mv/YXBsdXMtbWVkaWEt/bGlicmFyeS1zZXJ2/aWNlLW1lZGlhLzFm/NWEwNGJkLWM4OTYt/NDY2ZC05NDYxLTAw/ZjU4MDllZWZhMS5f/X0NSMjUsMCwxMjAw/LDEyMDBfUFQwX1NY/MzAwX1YxX19fLmpw/Zw";

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
