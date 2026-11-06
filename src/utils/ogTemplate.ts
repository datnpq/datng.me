/**
 * Shared Satori template for OG images (site + post).
 * Dark card, accent bar, avatar, Vietnamese-capable font loaded by the caller.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import config from "@/config";

const ACCENT = "#ff6b35";
const BG = "#0f172a";
const FG = "#f8fafc";
const MUTED = "#94a3b8";

let avatarDataUri: string | undefined;
function avatar(): string {
  if (!avatarDataUri) {
    const buf = readFileSync(join(process.cwd(), "public", "avatar.jpg"));
    avatarDataUri = `data:image/jpeg;base64,${buf.toString("base64")}`;
  }
  return avatarDataUri;
}

export function ogTemplate(opts: {
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  const { title, subtitle, meta } = opts;
  const titleSize = title.length > 70 ? 52 : title.length > 40 ? 60 : 72;
  return {
    key: null,
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        background: BG,
        color: FG,
        fontFamily: "Google Sans Code",
        paddingTop: "44px",
        paddingBottom: "40px",
        paddingLeft: "64px",
        paddingRight: "64px",
        position: "relative",
      },
      children: [
        // accent bar
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: "14px",
              height: "100%",
              background: `linear-gradient(180deg, ${ACCENT}, #a855f7)`,
            },
          },
        },
        // terminal badge
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              height: "40px",
              fontSize: 26,
              color: MUTED,
            },
            children: [
              {
                type: "span",
                props: { style: { color: ACCENT }, children: "~" },
              },
              { type: "span", props: { children: "/" } },
              {
                type: "span",
                props: { style: { color: ACCENT }, children: "coding" },
              },
              { type: "span", props: { children: "&" } },
              {
                type: "span",
                props: { style: { color: ACCENT }, children: "learning" },
              },
            ],
          },
        },
        // title block
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "350px",
              overflow: "hidden",
              paddingRight: "40px",
            },
            children: [
              {
                type: "p",
                props: {
                  style: {
                    fontSize: titleSize,
                    fontWeight: 700,
                    lineHeight: 1.15,
                    margin: 0,
                    maxHeight: "260px",
                    overflow: "hidden",
                  },
                  children: title,
                },
              },
              subtitle
                ? {
                    type: "p",
                    props: {
                      style: {
                        fontSize: 28,
                        color: MUTED,
                        margin: "20px 0 0",
                        lineHeight: 1.4,
                        maxHeight: "118px",
                        overflow: "hidden",
                      },
                      children: subtitle,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        // footer: avatar + name + domain
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "90px",
              marginTop: "26px",
              fontSize: 28,
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: "18px" },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: avatar(),
                        width: 72,
                        height: 72,
                        style: {
                          borderRadius: "9999px",
                          border: `3px solid ${ACCENT}`,
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", flexDirection: "column" },
                        children: [
                          {
                            type: "span",
                            props: {
                              style: { fontWeight: 700 },
                              children: config.site.author,
                            },
                          },
                          meta
                            ? {
                                type: "span",
                                props: {
                                  style: { fontSize: 22, color: MUTED },
                                  children: meta,
                                },
                              }
                            : null,
                        ].filter(Boolean),
                      },
                    },
                  ],
                },
              },
              {
                type: "span",
                props: {
                  style: { fontWeight: 700, color: ACCENT },
                  children: new URL(config.site.url).hostname,
                },
              },
            ],
          },
        },
      ],
    },
  };
}
