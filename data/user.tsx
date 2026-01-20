import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import "server-only";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

export const requireUser = cache(async () => {
  const session = await getCurrentUser();
  if (!session?.user) {
    redirect("/error?error=auth");
  }
  return session.user;
});
