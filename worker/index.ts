/**
 * datng.me edge worker.
 * - POST /api/subscribe  → add contact to Resend (newsletter)
 * - GET/POST /api/views/<slug> → read / increment a post's view counter (KV)
 * - GET/POST /api/visits → site-wide visitor counter (KV)
 * - /api/9x/*           → chatbox, poll, visitor diary, online count (Durable Object)
 * - everything else      → static assets (Astro build in ./dist)
 */
import { NineX } from "./ninex";
export { NineX };
export interface Env {
  ASSETS: Fetcher;
  VIEWS: KVNamespace;
  RESEND_API_KEY: string; // wrangler secret put RESEND_API_KEY
  RESEND_SEGMENT_ID?: string; // optional: put subscribers in a segment
  SITE_ORIGIN: string;
  NINEX: DurableObjectNamespace<NineX>;
  ADMIN_TOKEN?: string; // set in the Cloudflare dashboard; enables /quan-tri/
  HASH_SALT?: string; // optional: salt for hashing visitor IPs
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

function sameSite(request: Request, env: Env): boolean {
  const origin = request.headers.get("origin") ?? "";
  let host = "";
  try {
    host = new URL(origin).hostname;
  } catch {
    /* no origin header (e.g. same-origin GET) */
  }
  return [new URL(env.SITE_ORIGIN).hostname, "www.datng.me", "localhost", "127.0.0.1"].includes(host);
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

async function visits(request: Request, env: Env): Promise<Response> {
  const key = "visits:total";
  const current = Number((await env.VIEWS.get(key)) ?? "0");
  const headers = { "cache-control": "no-store" };
  if (request.method === "GET") return json({ ok: true, visits: current }, 200, headers);
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  if (!sameSite(request, env)) return json({ ok: false, error: "forbidden" }, 403);
  const next = current + 1;
  await env.VIEWS.put(key, String(next));
  return json({ ok: true, visits: next }, 200, headers);
}

// ---------- Góc giao lưu 9x ----------
// Strip control and bidi characters; keep newlines only where asked.
const CTRL_RE = /[\u0000-\u0009\u000b-\u001f\u007f​-‏‪-‮⁦-⁩]/g;
const clean = (v: unknown, max: number, multiline = false) => {
  let t = String(v ?? "").normalize("NFC").replace(CTRL_RE, "");
  if (!multiline) t = t.replace(/\n/g, " ");
  return t.replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
};
const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|vn|xyz|io|me)\b)/i;

async function ipHash(request: Request, env: Env) {
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const data = new TextEncoder().encode((env.HASH_SALT ?? "datng.me-9x") + ip);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf).slice(0, 12)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function isAdmin(request: Request, env: Env) {
  const token = env.ADMIN_TOKEN ?? "";
  const got = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (token.length < 16 || got.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}

async function ninex(request: Request, env: Env, path: string): Promise<Response> {
  const noStore = { "cache-control": "no-store" };
  const post = request.method === "POST";
  if (post && !sameSite(request, env)) return json({ ok: false, error: "forbidden" }, 403);
  if (!post && request.method !== "GET") return json({ ok: false, error: "method" }, 405);
  const body = post ? ((await request.json().catch(() => ({}))) as Record<string, unknown>) : {};
  if (post && body.website) return json({ ok: true }); // honeypot: bots fill it
  const stub = env.NINEX.get(env.NINEX.idFromName("main"));
  const ip = await ipHash(request, env);

  switch (path) {
    case "online":
      return json({ ok: true, online: await stub.ping(post ? clean(body.id, 40) : "") }, 200, noStore);
    case "chat": {
      if (!post) return json({ ok: true, messages: await stub.chatList() }, 200, noStore);
      const name = clean(body.name, 30) || "Khách";
      const msg = clean(body.msg, 200);
      if (!msg) return json({ ok: false, error: "empty" }, 400);
      if (LINK_RE.test(msg) || LINK_RE.test(name)) return json({ ok: false, error: "no_links" }, 400);
      const r = await stub.chatPost(ip, name, msg);
      return json(r, r.ok ? 200 : 429, noStore);
    }
    case "poll":
      if (!post) return json({ ok: true, ...(await stub.poll(ip)) }, 200, noStore);
      return json(await stub.vote(ip, Number(body.opt)), 200, noStore);
    case "diary": {
      if (!post) return json({ ok: true, entries: await stub.diaryList() }, 200, noStore);
      const entry = {
        name: clean(body.name, 30) || "Khách",
        title: clean(body.title, 80),
        mood: clean(body.mood, 30),
        song: clean(body.song, 80),
        content: clean(body.content, 1500, true),
      };
      if (!entry.title || entry.content.length < 10) return json({ ok: false, error: "too_short" }, 400);
      const r = await stub.diaryPost(ip, entry);
      return json(r, r.ok ? 200 : 429, noStore);
    }
    case "admin": {
      if (!env.ADMIN_TOKEN) return json({ ok: false, error: "not_configured" }, 503);
      if (!isAdmin(request, env)) return json({ ok: false, error: "unauthorized" }, 401);
      if (!post) return json({ ok: true, ...(await stub.adminList()) }, 200, noStore);
      return json(await stub.adminAction(String(body.kind), Number(body.id), String(body.action)), 200, noStore);
    }
  }
  return json({ ok: false, error: "not_found" }, 404);
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const viewsMatch = url.pathname.match(/^\/api\/views\/([^/]+)\/?$/);
    if (viewsMatch) return views(request, env, decodeURIComponent(viewsMatch[1]));
    if (url.pathname === "/api/visits") return visits(request, env);
    if (url.pathname.startsWith("/api/9x/")) return ninex(request, env, url.pathname.slice(8));
    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
      return subscribe(request, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
