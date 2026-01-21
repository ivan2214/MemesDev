import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/data/user";
import type { ErrorType } from "@/shared/constants";
import ErrorContent from "./_components/error-content";

export const metadata: Metadata = {
  title: "Error | MemesDev",
  description: "Ha ocurrido un error.",
};

export default function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{
    error: ErrorType;
  }>;
}) {
  return <ErrorPageInner searchParams={searchParams} />;
}

async function ErrorPageInner({
  searchParams,
}: {
  searchParams: Promise<{
    error: ErrorType;
  }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container mx-auto py-10">
      <AuthRedirect error={error} />
      <ErrorContent error={error} />
    </div>
  );
}

async function AuthRedirect({ error }: { error: ErrorType }) {
  const user = await getCurrentUser();

  if (error === "auth" && user) {
    redirect("/settings/profile");
  }

  return null;
}
