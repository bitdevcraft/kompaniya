import axios, { AxiosInstance } from "axios";
import { cookies, headers as nextHeaders } from "next/headers";

import { env } from "@/env/client";

// Whitelist only what you actually need to forward
const FORWARD = ["authorization", "accept-language", "user-agent"] as const;

export async function api(): Promise<AxiosInstance> {
  const h = await nextHeaders();
  const c = await cookies();

  const out: Record<string, string> = {};
  for (const name of FORWARD) {
    const v = h.get(name);
    if (v) out[name] = v;
  }
  const cookie = c.toString(); // builds "Cookie" header from current request
  if (cookie) out.cookie = cookie;

  return axios.create({
    baseURL: env.NEXT_PUBLIC_BASE_SERVER_URL,
    headers: out,
    withCredentials: true, // needed if your API reads cookies
  });
}
