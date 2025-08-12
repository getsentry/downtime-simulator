"use server";

import { logger } from "@sentry/nextjs";
import { kv } from "@vercel/kv";

export type ActionResponse =
  | {
      error?: string;
    }
  | undefined;

export async function createDowntime({
  host,
  status,
  duration,
}: {
  host: string;
  status: string;
  duration: number;
}): Promise<ActionResponse> {
  logger.info(logger.fmt`settings status to ${status}`);
  await kv.set(`host-status:${host}`, parseInt(status), { ex: duration });

  return;
}
