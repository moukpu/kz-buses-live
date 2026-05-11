import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KZ Buses Live · Автобусы Казахстана в реальном времени";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background:
          "radial-gradient(ellipse 80% 60% at 30% 0%, rgba(245, 158, 11, 0.18) 0%, transparent 60%), #0a0a0a",
        color: "#ededed",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "#1a1208",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "ui-monospace, monospace",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          KZ
        </div>
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 24,
            letterSpacing: -0.5,
            opacity: 0.85,
          }}
        >
          KZ Buses Live
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          Автобусы Казахстана в реальном времени
        </div>
        <div style={{ fontSize: 28, color: "#a3a3a3", maxWidth: 900 }}>
          12 городов · MapLibre · GTFS-Realtime · Next.js 15
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#737373",
          fontFamily: "ui-monospace, monospace",
          fontSize: 18,
          letterSpacing: -0.2,
        }}
      >
        <span>kz-buses-live</span>
        <span>moukpu · 2026</span>
      </div>
    </div>,
    { ...size },
  );
}
