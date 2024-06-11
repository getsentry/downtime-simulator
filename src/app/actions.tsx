"use server";

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
  console.log(`settings status to ${status}`);
  await kv.set(`host-status:${host}`, parseInt(status), { ex: duration });

  return;
}
