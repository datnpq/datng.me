/**
 * datng.me edge worker.
 * - POST /api/subscribe  → add contact to Resend (newsletter)
 * - GET/POST /api/views/<slug> → read / increment a post's view counter (KV)
 * - everything else      → static assets (Astro build in ./dist)
 */
export interface Env {
  ASSETS: Fetcher;
  VIEWS: KVNamespace;
  RESEND_API_KEY: string; // wrangler secret put RESEND_API_KEY
  RESEND_SEGMENT_ID?: string; // optional: put subscribers in a segment
  SITE_ORIGIN: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
}

async function subscribe(request: Request, env: Env): Promise<Response> {
  // Same-origin only (hostname check; wrangler dev rewrites the scheme/host to the route)
  const origin = request.headers.get("origin") ?? "";
  let host = "";
  try {
    host = new URL(origin).hostname;
  } catch {
    /* no/invalid origin header */
  }
  const allowedHosts = [new URL(env.SITE_ORIGIN).hostname, "www.datng.me", "localhost", "127.0.0.1"];
  if (!allowedHosts.includes(host)) return json({ ok: false, error: "forbidden" }, 403);

  let email = "";
  let honeypot = "";
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;
    email = body.email ?? "";
    honeypot = body.website ?? "";
  } else {
    const form = await request.formData().catch(() => null);
    email = String(form?.get("email") ?? "");
    honeypot = String(form?.get("website") ?? "");
  }

  // Bots fill the hidden field; pretend success.
  if (honeypot) return json({ ok: true });

  email = email.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }
  if (!env.RESEND_API_KEY) return json({ ok: false, error: "not_configured" }, 503);

  const payload: Record<string, unknown> = { email, unsubscribed: false };
  if (env.RESEND_SEGMENT_ID) payload.segments = [{ id: env.RESEND_SEGMENT_ID }];

  const res = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) return json({ ok: true });
  const err = (await res.json().catch(() => ({}))) as { message?: string; name?: string };
  // Already subscribed → treat as success for the reader.
  if (res.status === 409 || /already/i.test(err.message ?? "")) return json({ ok: true });
  // eslint-disable-next-line no-console
  console.error("resend error", res.status, err);
  return json({ ok: false, error: "upstream" }, 502);
}

const SLUG_RE = /^[a-z0-9-]{1,120}$/;

async function views(request: Request, env: Env, slug: string): Promise<Response> {
  if (!SLUG_RE.test(slug)) return json({ ok: false, error: "bad_slug" }, 400);
  const key = `views:${slug}`;
  const current = Number((await env.VIEWS.get(key)) ?? "0");
  const headers = { "cache-control": "no-store", "access-control-allow-origin": env.SITE_ORIGIN };
  if (request.method === "GET") return json({ ok: true, views: current }, 200, headers);
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  // Same-site only; KV writes are eventually consistent, good enough for a blog counter.
  const origin = request.headers.get("origin") ?? "";
  let host = "";
  try {
    host = new URL(origin).hostname;
  } catch {
    /* ignore */
  }
  if (![new URL(env.SITE_ORIGIN).hostname, "www.datng.me", "localhost"].includes(host)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }
  const next = current + 1;
  await env.VIEWS.put(key, String(next));
  return json({ ok: true, views: next }, 200, headers);
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const viewsMatch = url.pathname.match(/^\/api\/views\/([^/]+)\/?$/);
    if (viewsMatch) return views(request, env, decodeURIComponent(viewsMatch[1]));
    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
      return subscribe(request, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
