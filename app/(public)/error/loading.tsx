import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert
          variant="destructive"
          className="border-destructive/50 bg-destructive/10"
        >
          <AlertCircle className="h-5 w-5" />

          {/* Title dinámico */}
          <AlertTitle className="ml-2 font-semibold text-lg">
            <Skeleton className="h-5 w-40" />
          </AlertTitle>

          {/* Description dinámica */}
          <AlertDescription className="mt-2 ml-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
