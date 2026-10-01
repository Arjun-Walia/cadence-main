import { ImageResponse } from "next/og";

const SIZES = {
  "192": { px: 192, maskable: false },
  "512": { px: 512, maskable: false },
  maskable: { px: 512, maskable: true },
} as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> },
) {
  const { size } = await context.params;
  const spec = SIZES[size as keyof typeof SIZES];
  if (!spec) return new Response("Not found", { status: 404 });

  const fontSize = Math.round(spec.px * (spec.maskable ? 0.42 : 0.56));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontSize,
          fontWeight: 700,
          letterSpacing: Math.round(spec.px * -0.04),
        }}
      >
        C
      </div>
    ),
    { width: spec.px, height: spec.px },
  );
}
