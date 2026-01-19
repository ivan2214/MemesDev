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
  logoUrl:
    "https://imgs.search.brave.com/z5-PYgqXAaQOoTCqgYu_e1jF5m_6xufn95YZndUGtAM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL1Mv/YXBsdXMtbWVkaWEt/bGlicmFyeS1zZXJ2/aWNlLW1lZGlhLzFm/NWEwNGJkLWM4OTYt/NDY2ZC05NDYxLTAw/ZjU4MDllZWZhMS5f/X0NSMjUsMCwxMjAw/LDEyMDBfUFQwX1NY/MzAwX1YxX19fLmpw/Zw",
  expiresIn: "15 minutos",
};

export default MagicLinkEmail;
