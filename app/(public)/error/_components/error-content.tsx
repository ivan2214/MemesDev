"use client";

import { AlertCircle } from "lucide-react";

import { useEffect, useState } from "react";
import { AuthDialog } from "@/shared/components/auth-dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { ERROR_MESSAGES, type ErrorType } from "@/shared/constants";

export default function ErrorContent({ error }: { error: ErrorType }) {
  const [isAuthOpen, setAuthOpen] = useState(false);

  const errorType = error && error in ERROR_MESSAGES ? error : "default";
  const { title, description } = ERROR_MESSAGES[errorType];

  useEffect(() => {
    if (error === "auth") {
      setAuthOpen(true);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert
          variant="destructive"
          className="border-destructive/50 bg-destructive/10"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="ml-2 font-semibold text-lg">
            {title}
          </AlertTitle>
          <AlertDescription className="mt-2 ml-2 text-muted-foreground">
            {description}
          </AlertDescription>
        </Alert>

        <AuthDialog open={isAuthOpen} onOpenChange={setAuthOpen} />
      </div>
    </div>
  );
}
