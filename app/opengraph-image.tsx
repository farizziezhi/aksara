import { ImageResponse } from "next/og";

export const alt = "Aksara — Open Access Journal Search";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily: "Inter, system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0d111b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#0d111b" }}>
            Aksara
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 600,
              color: "#000000",
              letterSpacing: -3,
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            Cari paper open-access seperti seorang peneliti.
          </div>
          <div style={{ fontSize: 26, color: "#1e1e1e", maxWidth: 860 }}>
            Penelusuran terpadu lintas OpenAlex, CORE, arXiv, DOAJ, Crossref, Europe PMC.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#8d8d8d" }}>
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: "#0098f2" }} />
          aksara-ivory-theta.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
