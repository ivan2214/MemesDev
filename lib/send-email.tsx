import { render } from "@react-email/render";
import { transporter } from "@/config/mail.config";
import MagicLinkEmail from "@/emails/magic-link-email";
import NotificationEmail from "@/emails/notification-email";
import { env } from "@/env/server";
import type { NotificationType } from "@/shared/types";

interface BaseEmailParams {
  to: string;
  userFirstname?: string;
}

interface MagicLinkEmailParams extends BaseEmailParams {
  type: "magic-link";
  magicLinkUrl: string;
  expiresIn?: string;
}

interface NotificationEmailParams extends BaseEmailParams {
  type: "notification";
  notificationType: NotificationType;
  message: string;
  link?: string;
  fromUser?: string;
}

type EmailParams = MagicLinkEmailParams | NotificationEmailParams;

const APP_NAME = "Memes Dev";
const LOGO_URL = "https://memes-dev-prod.t3.storage.dev/logo.webp";

const subjectMap: Record<string, string> = {
  "magic-link": `${APP_NAME} - Enlace de inicio de sesión`,
  "notification-like": `${APP_NAME} - ¡Alguien le dio like a tu meme!`,
  "notification-comment": `${APP_NAME} - ¡Nuevo comentario en tu meme!`,
  "notification-follow": `${APP_NAME} - ¡Tienes un nuevo seguidor!`,
  "notification-system": `${APP_NAME} - Notificación del sistema`,
};

export async function sendEmail(params: EmailParams) {
  let html: string;
  let subject: string;

  if (params.type === "magic-link") {
    html = await render(
      MagicLinkEmail({
        appName: APP_NAME,
        logoUrl: LOGO_URL,
        magicLinkUrl: params.magicLinkUrl,
        expiresIn: params.expiresIn,
      }),
    );
    subject = subjectMap["magic-link"];
  } else {
    html = await render(
      NotificationEmail({
        appName: APP_NAME,
        logoUrl: LOGO_URL,
        notificationType: params.notificationType,
        message: params.message,
        link: params.link,
        fromUser: params.fromUser,
      }),
    );
    subject = subjectMap[`notification-${params.notificationType}`];
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: params.to,
    subject,
    html,
  });
}
