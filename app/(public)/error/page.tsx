import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/data/user";
import type { ErrorType } from "@/shared/_constants";
import ErrorContent from "./_components/error-content";

export const metadata: Metadata = {
  title: "Error | MemesDev",
  description: "Ha ocurrido un error.",
};

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{
    error: ErrorType;
  }>;
}) {
  const { error } = await searchParams;

  const user = await getCurrentUser();

  if (error === "auth" && user) {
    redirect("/settings/profile");
  }

  return (
    <div className="container mx-auto py-10">
      <Suspense
        fallback={<div className="flex justify-center p-10">Cargando...</div>}
      >
        <ErrorContent error={error} />
      </Suspense>
    </div>
  );
}
