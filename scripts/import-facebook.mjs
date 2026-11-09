#!/usr/bin/env node
/**
 * Import a Facebook "Download your information" export (JSON format) into
 * src/data/facebook/wall.json + resized photos in src/assets/images/fb-wall/.
 *
 * The raw export must live OUTSIDE the repo (the repo is public).
 *
 *   node scripts/import-facebook.mjs --src "C:/path/to/extracted-export" [--since 2009] [--max 2000] [--no-images]
 *
 * Privacy defaults:
 *  - Only your own posts. Messages, logins, IPs, locations, contacts, ads data are never read.
 *  - Friends' names are shortened ("Nguyễn Văn An" -> "An N.").
 *  - Posts that tag other people get "hidden": true. Flip it in wall.json to publish.
 *  - Re-running keeps any "hidden" values you edited by hand (matched by post id).
 */
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = join(ROOT, "src/data/facebook/wall.json");
const OUT_IMG = join(ROOT, "src/assets/images/fb-wall");

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? true : all[i + 1]]);
    return acc;
  }, [])
);
if (!args.src || args.src === true) {
  console.error('Usage: node scripts/import-facebook.mjs --src "<extracted export folder>"');
  process.exit(1);
}
const SRC = resolve(args.src);
if (SRC.startsWith(ROOT)) {
  console.error("Refusing: the raw export must be outside the repo (it is public).");
  process.exit(1);
}
const SINCE = Number(args.since ?? 0);
const MAX = Number(args.max ?? 5000);
const WITH_IMAGES = !args["no-images"];

// Facebook escapes UTF-8 bytes as latin1 code points ("Ä\u0091" instead of "đ").
const fix = s => {
  if (typeof s !== "string") return s;
  if (![...s].every(c => c.charCodeAt(0) < 256)) return s;
  try { return Buffer.from(s, "latin1").toString("utf8"); } catch { return s; }
};
const fixDeep = v =>
  Array.isArray(v) ? v.map(fixDeep)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixDeep(x)]))
  : fix(v);

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const shortName = full => {
  const parts = String(full).trim().split(/\s+/);
  if (parts.length < 2) return parts[0] || "Ẩn danh";
  return `${parts.at(-1)} ${parts[0][0]}.`;
};
const iso = ts => {
  // Format the timestamp in Vietnam time with an explicit +07:00 offset.
  const d = new Date((ts + 7 * 3600) * 1000).toISOString().slice(0, 19);
  return `${d}+07:00`;
};
const readJson = async p => fixDeep(JSON.parse(await readFile(p, "utf8")));

const all = await walk(SRC);
const byName = n => all.filter(p => basename(p).toLowerCase() === n);
const index = new Map(all.map(p => [basename(p), p]));
const resolveUri = uri => {
  for (let d = SRC, i = 0; i < 3; d = dirname(d), i++) {
    const p = join(d, uri);
    if (existsSync(p)) return p;
  }
  return index.get(basename(uri));
};

// ---- profile
let profile = { name: "Đạt", username: "datnpq", status: "", joined: null, disabledAt: "2026-11-06", info: [] };
const profFile = byName("profile_information.json")[0];
if (profFile) {
  const j = await readJson(profFile);
  const p = j.profile_v2 ?? j.profile ?? {};
  profile.name = p.name?.full_name ?? profile.name;
  if (p.registration_timestamp) profile.joined = iso(p.registration_timestamp).slice(0, 10);
  if (profile.joined) {
    const d = new Date(profile.joined);
    profile.info.push(["Tham gia", `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`]);
  }
  if (p.current_city?.name) profile.info.push(["Sống tại", p.current_city.name]);
  if (p.hometown?.name) profile.info.push(["Quê quán", p.hometown.name]);
}
profile.info.push(["Trang web", "https://datng.me"]);

// ---- friends (names shortened)
let friends = { total: 0, list: [] };
const friendFile = byName("your_friends.json")[0] ?? byName("friends.json")[0];
if (friendFile) {
  const j = await readJson(friendFile);
  const list = j.friends_v2 ?? j.friends ?? [];
  friends.total = list.length;
  friends.list = [...list].sort((a, b) => a.timestamp - b.timestamp).slice(0, 6).map(f => ({ name: shortName(f.name) }));
}

// ---- posts
const postFiles = all.filter(p => /your_posts.*\.json$/i.test(basename(p)));
let raw = [];
for (const f of postFiles) {
  const j = await readJson(f);
  raw.push(...(Array.isArray(j) ? j : j.status_updates_v2 ?? j.posts ?? []));
}
raw = raw.filter(p => p.timestamp && new Date(p.timestamp * 1000).getFullYear() >= SINCE)
  .sort((a, b) => b.timestamp - a.timestamp)
  .slice(0, MAX);

let previous = new Map();
if (existsSync(OUT_JSON)) {
  try {
    const old = JSON.parse(await readFile(OUT_JSON, "utf8"));
    if (!old.sample) previous = new Map(old.posts.map(p => [p.id, p]));
  } catch {}
}

await mkdir(OUT_IMG, { recursive: true });
const posts = [];
let imgCount = 0, tagged = 0;
for (const p of raw) {
  const text = (p.data ?? []).map(d => d.post).filter(Boolean).join("\n").trim();
  const media = (p.attachments ?? []).flatMap(a => a.data ?? []).map(d => d.media).filter(Boolean);
  const link = (p.attachments ?? []).flatMap(a => a.data ?? []).map(d => d.external_context?.url).find(Boolean);
  const id = `p${p.timestamp}`;
  const images = [];
  if (WITH_IMAGES) {
    for (const [n, m] of media.entries()) {
      const src = m.uri && resolveUri(m.uri);
      if (!src || !/\.(jpe?g|png|webp|gif)$/i.test(extname(src))) continue;
      const name = `${id}-${n}.jpg`;
      const dest = join(OUT_IMG, name);
      if (!existsSync(dest)) {
        await sharp(src).rotate().resize({ width: 960, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(dest);
      }
      images.push(name);
      imgCount++;
    }
  }
  const caption = text || media.map(m => m.description).find(Boolean) || "";
  if (!caption && images.length === 0 && !link) continue;
  const hasTags = (p.tags ?? []).length > 0;
  if (hasTags) tagged++;
  const prev = previous.get(id);
  posts.push({
    id,
    date: iso(p.timestamp),
    kind: images.length ? "photo" : link ? "link" : "status",
    text: caption,
    images,
    ...(link ? { link } : {}),
    likes: 0,
    comments: [],
    hidden: prev?.hidden ?? hasTags,
  });
}

if (profile.joined) {
  posts.push({ id: "joined", date: `${profile.joined}T12:00:00+07:00`, kind: "event", text: "đã tham gia Facebook.", images: [], likes: 0, comments: [] });
}
posts.unshift({ id: "disabled", date: "2026-11-06T09:00:00+07:00", kind: "event", text: "— tài khoản bị vô hiệu hoá, không một lời giải thích.", images: [], likes: 0, comments: [] });

await writeFile(OUT_JSON, JSON.stringify({ sample: false, profile, friends, posts }, null, 2) + "\n");
const size = (await stat(OUT_JSON)).size;
console.log(`Profile: ${profile.name}, joined ${profile.joined ?? "?"}`);
console.log(`Friends: ${friends.total} (showing 6, names shortened)`);
console.log(`Posts: ${posts.length} written (${tagged} tag other people -> hidden), ${imgCount} images`);
console.log(`Wrote ${OUT_JSON} (${(size / 1024).toFixed(0)} KB)`);
