import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { ErrorTypeMessages } from "@/shared/constants";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
});

export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/error?error=${ErrorTypeMessages.auth}`);
  }
  return user;
});
