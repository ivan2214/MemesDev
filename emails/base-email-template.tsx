import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type React from "react";

export interface BaseEmailTemplateProps {
  userFirstname?: string;
  appName: string;
  logoUrl?: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
  token?: string;
  showSecurityWarning?: boolean;
  additionalContent?: React.ReactNode;
}

export function BaseEmailTemplate({
  userFirstname,
  appName,
  logoUrl,
  title,
  description,
  buttonText,
  buttonUrl,
  footerText = "Gracias por confiar en nosotros!",
  token,
  showSecurityWarning = true,
  additionalContent,
}: BaseEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl && (
            <Img
              style={logo}
              src={logoUrl}
              width="150"
              alt={`${appName} logo`}
            />
          )}

          <Section>
            {userFirstname && (
              <Text style={greeting}>Hola {userFirstname},</Text>
            )}
            <Text style={text}>{description}</Text>

            {buttonText && buttonUrl && (
              <Button style={button} href={buttonUrl}>
                {buttonText}
              </Button>
            )}

            {token && (
              <Section style={tokenContainer}>
                <Text style={tokenLabel}>Tu código de verificación:</Text>
                <Text style={tokenCode}>{token}</Text>
              </Section>
            )}

            {additionalContent}

            {showSecurityWarning && (
              <>
                <Hr style={hr} />
                <Text style={securityText}>
                  Para proteger tu cuenta, no reenvíes este correo electrónico.
                </Text>
              </>
            )}

            <Text style={footer}>{footerText}</Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerLinks}>
              <Link href="#" style={link}>
                Política de Privacidad
              </Link>
              {" • "}
              <Link href="#" style={link}>
                Términos de Servicio
              </Link>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} {appName}. Todos los derechos
              reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "480px",
};

const logo = {
  borderRadius: "12px",
  marginBottom: "24px",
};

const greeting = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "8px",
};

const text = {
  fontSize: "15px",
  fontWeight: "400",
  color: "#4b5563",
  lineHeight: "24px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#e92932",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "14px 24px",
  marginBottom: "24px",
};

const tokenContainer = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const tokenLabel = {
  fontSize: "13px",
  color: "#6b7280",
  marginBottom: "8px",
};

const tokenCode = {
  fontSize: "28px",
  fontWeight: "700",
  fontFamily: "monospace",
  letterSpacing: "4px",
  color: "#e92932",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const securityText = {
  fontSize: "13px",
  color: "#9ca3af",
  textAlign: "center" as const,
  marginBottom: "16px",
};

const footer = {
  fontSize: "15px",
  color: "#4b5563",
  marginTop: "24px",
};

const footerSection = {
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid #e5e7eb",
};

const footerLinks = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  marginBottom: "8px",
};

const link = {
  color: "#6b7280",
  textDecoration: "underline",
};

const copyright = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
