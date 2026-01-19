import nodemailer from "nodemailer";
import { env } from "@/env/server";

export default {
  from: env.EMAIL_FROM || "info@next-bard.com",
} as const;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  secure: true,
});
