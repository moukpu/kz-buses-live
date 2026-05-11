import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        color: "#1a1208",
        fontFamily: "ui-monospace, monospace",
        fontSize: 90,
        fontWeight: 800,
        letterSpacing: -2,
        borderRadius: 36,
      }}
    >
      KZ
    </div>,
    { ...size },
  );
}
