import { Text } from "@react-email/components";
import { env } from "@/env/server";
import { BaseEmailTemplate } from "./base-email-template";

interface NotificationEmailProps {
  appName: string;
  logoUrl?: string;
  notificationType: "like" | "comment" | "follow" | "system";
  message: string;
  link?: string;
  fromUser?: string;
}

const notificationTitles = {
  like: "¡Alguien le dio like a tu meme!",
  comment: "¡Nuevo comentario en tu meme!",
  follow: "¡Tienes un nuevo seguidor!",
  system: "Notificación del sistema",
};

const notificationDescriptions = {
  like: "Tu meme está recibiendo atención. ¡Sigue creando contenido increíble!",
  comment:
    "Alguien ha dejado un comentario en tu meme. ¡Revisa lo que tienen que decir!",
  follow: "¡Tu comunidad está creciendo! Tienes un nuevo seguidor.",
  system: "Tienes una nueva notificación importante.",
};

export function NotificationEmail({
  appName,
  logoUrl,
  notificationType,
  message,
  link,
}: NotificationEmailProps) {
  return (
    <BaseEmailTemplate
      appName={appName}
      logoUrl={logoUrl}
      title={notificationTitles[notificationType]}
      description={notificationDescriptions[notificationType]}
      buttonText={link ? "Ver detalle" : undefined}
      buttonUrl={link}
      showSecurityWarning={false}
      footerText="¡Gracias por ser parte de nuestra comunidad de memes!"
      additionalContent={
        <Text
          style={{
            fontSize: "14px",
            color: "#374151",
            backgroundColor: "#f3f4f6",
            padding: "16px",
            borderRadius: "8px",
            borderLeft: "4px solid #e92932",
            marginBottom: "24px",
          }}
        >
          {message}
        </Text>
      }
    />
  );
}

NotificationEmail.PreviewProps = {
  appName: "Memes Dev",
  logoUrl: "https://memes-dev-prod.t3.storage.dev/logo.webp",
  notificationType: "like" as const,
  message: "@liberallibertario le dio like a tu meme de test",
  link: `${env.APP_URL}/meme/123`,
  fromUser: "liberallibertario",
};

export default NotificationEmail;
