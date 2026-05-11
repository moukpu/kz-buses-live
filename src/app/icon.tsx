import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: -0.5,
        borderRadius: 6,
      }}
    >
      KZ
    </div>,
    { ...size },
  );
}
