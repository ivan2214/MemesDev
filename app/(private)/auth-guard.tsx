import type React from "react";
import { requireUser } from "@/data/user";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
