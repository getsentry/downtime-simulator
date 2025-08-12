import { Alert, AlertDescription } from "@/components/ui/alert";
import { kv } from "@vercel/kv";
import { Info } from "lucide-react";
import { notFound } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { PrismaClient } from "@prisma/client";

async function queryPosts() {
  const prisma = new PrismaClient();
  const posts = await prisma.post.findMany();

  return posts;
}

const Page = async ({ params }: { params: Promise<{ host: string }> }) => {
  const { host } = await params;
  const hostStatus: number | null = await kv.get(`host-status:${host}`);

  if (hostStatus === 404) {
    notFound();
  }

  if (hostStatus === 500) {
    await queryPosts();
  }

  await Sentry.flush();

  return (
    <div className="container max-w-lg p-12">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No downtime set for <pre>{host}</pre>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Page;
