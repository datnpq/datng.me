/**
 * "Góc giao lưu 9x" state: chatbox, poll, visitor diary, who's online.
 * One SQLite-backed Durable Object instance ("main") holds everything.
 * Visitors are identified only by a salted hash of their IP (see index.ts).
 */
import { DurableObject } from "cloudflare:workers";

export const POLL = {
  id: "web-2026",
  question: "Bạn thấy cái web này thế nào?",
  options: ["Đẹp y chang hồi 2008", "Hoài niệm muốn khóc 😭", "Bình thường thôi", "Sến quá trời 😅"],
};

const ONLINE_WINDOW_MS = 90_000;
const CHAT_GAP_MS = 15_000;
const DIARY_GAP_MS = 5 * 60_000;

export type ChatRow = { id: number; name: string; msg: string; ts: number };
export type DiaryRow = { id: number; name: string; title: string; mood: string; song: string; content: string; ts: number; status?: string };

export class NineX extends DurableObject {
  private sql: SqlStorage;
  private online = new Map<string, number>();

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env as never);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS chat (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, msg TEXT, ts INTEGER, ip TEXT, hidden INTEGER DEFAULT 0);
      CREATE TABLE IF NOT EXISTS diary (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, title TEXT, mood TEXT, song TEXT, content TEXT, ts INTEGER, ip TEXT, status TEXT DEFAULT 'pending');
      CREATE TABLE IF NOT EXISTS votes (poll TEXT, ip TEXT, opt INTEGER, ts INTEGER, PRIMARY KEY (poll, ip));
    `);
  }

  // ---- who's online (memory only; resets when the object sleeps, which is fine)
  ping(visitor: string): number {
    const now = Date.now();
    if (visitor) this.online.set(visitor, now);
    for (const [k, t] of this.online) if (now - t > ONLINE_WINDOW_MS) this.online.delete(k);
    return Math.max(this.online.size, visitor ? 1 : 0);
  }

  // ---- chat
  chatList(): ChatRow[] {
    return this.sql
      .exec<ChatRow>("SELECT id, name, msg, ts FROM chat WHERE hidden = 0 ORDER BY id DESC LIMIT 40")
      .toArray()
      .reverse();
  }
  chatPost(ip: string, name: string, msg: string): { ok: boolean; error?: string } {
    const last = this.sql.exec<{ ts: number }>("SELECT ts FROM chat WHERE ip = ? ORDER BY id DESC LIMIT 1", ip).toArray()[0];
    if (last && Date.now() - last.ts < CHAT_GAP_MS) return { ok: false, error: "too_fast" };
    this.sql.exec("INSERT INTO chat (name, msg, ts, ip) VALUES (?, ?, ?, ?)", name, msg, Date.now(), ip);
    this.sql.exec("DELETE FROM chat WHERE id <= (SELECT id FROM chat ORDER BY id DESC LIMIT 1 OFFSET 500)");
    return { ok: true };
  }

  // ---- poll
  poll(ip: string) {
    const rows = this.sql.exec<{ opt: number; n: number }>("SELECT opt, COUNT(*) AS n FROM votes WHERE poll = ? GROUP BY opt", POLL.id).toArray();
    const counts = POLL.options.map((_, i) => rows.find(r => r.opt === i)?.n ?? 0);
    const mine = this.sql.exec<{ opt: number }>("SELECT opt FROM votes WHERE poll = ? AND ip = ?", POLL.id, ip).toArray()[0];
    return { ...POLL, counts, voted: mine ? mine.opt : null };
  }
  vote(ip: string, opt: number) {
    if (!(opt >= 0 && opt < POLL.options.length)) return { ok: false, error: "bad_option" };
    this.sql.exec("INSERT OR IGNORE INTO votes (poll, ip, opt, ts) VALUES (?, ?, ?, ?)", POLL.id, ip, opt, Date.now());
    return { ok: true, ...this.poll(ip) };
  }

  // ---- visitor diary (moderated)
  diaryList(): DiaryRow[] {
    return this.sql
      .exec<DiaryRow>("SELECT id, name, title, mood, song, content, ts FROM diary WHERE status = 'approved' ORDER BY id DESC LIMIT 30")
      .toArray();
  }
  diaryPost(ip: string, e: Omit<DiaryRow, "id" | "ts">) {
    const last = this.sql.exec<{ ts: number }>("SELECT ts FROM diary WHERE ip = ? ORDER BY id DESC LIMIT 1", ip).toArray()[0];
    if (last && Date.now() - last.ts < DIARY_GAP_MS) return { ok: false, error: "too_fast" };
    const pending = this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM diary WHERE status = 'pending'").toArray()[0].n;
    if (pending >= 200) return { ok: false, error: "queue_full" };
    this.sql.exec(
      "INSERT INTO diary (name, title, mood, song, content, ts, ip) VALUES (?, ?, ?, ?, ?, ?, ?)",
      e.name, e.title, e.mood, e.song, e.content, Date.now(), ip
    );
    return { ok: true };
  }

  // ---- admin
  adminList() {
    return {
      pending: this.sql.exec<DiaryRow>("SELECT id, name, title, mood, song, content, ts, status FROM diary WHERE status = 'pending' ORDER BY id").toArray(),
      diary: this.diaryList(),
      chat: this.sql.exec<ChatRow & { hidden: number }>("SELECT id, name, msg, ts, hidden FROM chat ORDER BY id DESC LIMIT 100").toArray(),
    };
  }
  adminAction(kind: string, id: number, action: string) {
    if (kind === "diary" && action === "approve") this.sql.exec("UPDATE diary SET status = 'approved' WHERE id = ?", id);
    else if (kind === "diary" && action === "delete") this.sql.exec("DELETE FROM diary WHERE id = ?", id);
    else if (kind === "chat" && action === "hide") this.sql.exec("UPDATE chat SET hidden = 1 WHERE id = ?", id);
    else if (kind === "chat" && action === "show") this.sql.exec("UPDATE chat SET hidden = 0 WHERE id = ?", id);
    else return { ok: false, error: "bad_action" };
    return { ok: true };
  }
}
