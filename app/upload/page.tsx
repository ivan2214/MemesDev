import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { UploadMemeForm } from "./_components/upload-meme-form";

export default function UploadPage() {
  return (
    <section className="container mx-auto h-full w-full px-4 py-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Suba su meme</CardTitle>
          <CardDescription>
            Suba su meme para que otros usuarios lo vean
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadMemeForm />
        </CardContent>
      </Card>
    </section>
  );
}
