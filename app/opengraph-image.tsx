import { ImageResponse } from "next/og";
import { site } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0A0A0A",
          color: "#F5F4F0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 20, color: "#FF6B35", letterSpacing: 4, textTransform: "uppercase" }}>
          {site.domain}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 20, lineHeight: 1.1 }}>
          {site.name}
        </div>
        <div style={{ fontSize: 28, color: "#9B9994", marginTop: 24, maxWidth: 900 }}>
          {site.description}
        </div>
      </div>
    ),
    size
  );
}
