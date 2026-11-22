// Copyright 2026 Kayode Edoun

/**
 * POST /api/vitals — receives one Core Web Vital from the browser.
 *
 * The free Speed Insights tier only shows the Real Experience Score, so the
 * page reports each metric (LCP, INP, CLS, FCP, TTFB) here and this route
 * writes one structured log line per metric. Read them in Runtime Logs by
 * searching for "web-vital". Nothing is stored and nothing is returned.
 */

import { z } from "zod";

// One metric is about 150 bytes; anything much larger isn't from our page.
const MAX_BODY_BYTES = 1_000;

const vitalSchema = z
  .object({
    name: z.enum(["LCP", "INP", "CLS", "FCP", "TTFB"]),
    // Milliseconds for timings; a unitless score for CLS.
    value: z.number().finite().min(0).max(600_000),
    rating: z.enum(["good", "needs-improvement", "poor"]),
    id: z.string().min(1).max(100),
    navigationType: z.string().max(50).optional(),
    // Path only, never the query string, so no user input ends up in logs.
    path: z.string().startsWith("/").max(200),
  })
  .strict();

export async function POST(request: Request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = vitalSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  // One structured log line per metric, like the "analysis" line in /api/analyze.
  console.log("web-vital", {
    ...parsed.data,
    value: Math.round(parsed.data.value * 1000) / 1000,
    env: process.env.VERCEL_ENV ?? "development",
  });

  return new Response(null, { status: 204 });
}
