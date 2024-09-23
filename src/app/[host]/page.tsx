import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { kv } from "@vercel/kv";
import { Info } from "lucide-react";
import { notFound } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

const Page = async ({ params: { host } }: { params: { host: string } }) => {
  const hostStatus: number | null = await kv.get(`host-status:${host}`);

  if (hostStatus === 404) {
    notFound();
  }

  async function queryPosts() {
    "use server";
    return await Sentry.withServerActionInstrumentation(
      "queryPosts",
      {
        headers: headers(),
        recordResponse: true,
      },
      async () => {
        const prisma = new PrismaClient();
        const posts = await prisma.post.findMany();

        return posts;
      }
    );
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
