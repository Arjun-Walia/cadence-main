import { ImageResponse } from "next/og";

export const alt = "Proofline";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          padding: "80px",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            background: "#ffffff",
            color: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          C
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1,
          }}
        >
          Proofline
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 32,
            color: "#a3a3a3",
          }}
        >
          Decide who to contact first.
        </div>
      </div>
    ),
    { ...size },
  );
}
