import { readFile } from "node:fs/promises";
import path from "node:path";

const FILES = {
  "192": "icon-192.png",
  "512": "icon-512.png",
  maskable: "icon-maskable.png",
} as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> },
) {
  const { size } = await context.params;
  const file = FILES[size as keyof typeof FILES];
  if (!file) return new Response("Not found", { status: 404 });

  const bytes = await readFile(path.join(process.cwd(), "public", "brand", file));
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
