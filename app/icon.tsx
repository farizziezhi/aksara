import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d111b",
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        A
        <span style={{ color: "#0098f2", marginLeft: 1 }}>.</span>
      </div>
    ),
    { ...size },
  );
}
