import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import "server-only";
import { ErrorTypeMessages } from "@/shared/_constants";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

export const requireUser = cache(async () => {
  const session = await getCurrentUser();
  if (!session?.user) {
    redirect(`/error?error=${ErrorTypeMessages.auth}`);
  }
  return session.user;
});
