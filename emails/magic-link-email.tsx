import { env } from "@/env/server";
import { BaseEmailTemplate } from "./base-email-template";

interface MagicLinkEmailProps {
  appName: string;
  logoUrl?: string;
  magicLinkUrl: string;
  expiresIn?: string;
}

export function MagicLinkEmail({
  appName,
  logoUrl,
  magicLinkUrl,
  expiresIn = "15 minutos",
}: MagicLinkEmailProps) {
  return (
    <BaseEmailTemplate
      appName={appName}
      logoUrl={logoUrl}
      title={`${appName} - Enlace de inicio de sesión`}
      description={`Solicitaste iniciar sesión en tu cuenta. Haz clic en el botón de abajo para acceder de forma segura. Este enlace expirará en ${expiresIn}.`}
      buttonText="Iniciar sesión"
      buttonUrl={magicLinkUrl}
      footerText="Si no solicitaste este enlace, puedes ignorar este correo de forma segura."
    />
  );
}

MagicLinkEmail.PreviewProps = {
  appName: "Memes Dev",
  logoUrl: "https://memes-dev-prod.t3.storage.dev/logo.webp",
  expiresIn: "15 minutos",
  magicLinkUrl: `${env.APP_URL}/auth/magic?token=1234567890`,
};

export default MagicLinkEmail;
