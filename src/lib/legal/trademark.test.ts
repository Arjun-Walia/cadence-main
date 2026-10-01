import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PROOFLINE_MARK,
  PROOFLINE_NOTICE,
  PROOFLINE_RIGHTS_HOLDER,
  PROOFLINE_RIGHTS_HOLDERS,
} from "./trademark";

const root = resolve(import.meta.dirname, "../../..");

describe("Proofline trademark", () => {
  it("names the mark, the rights holder, and the permission requirement", () => {
    expect(PROOFLINE_MARK).toBe("Proofline");
    expect(PROOFLINE_RIGHTS_HOLDER).toBe("Arjun-Walia and Abhishek");
    expect(PROOFLINE_RIGHTS_HOLDERS.map((holder) => holder.github)).toEqual([
      "Arjun-Walia",
      "itsawesomeabhishek",
    ]);
    expect(PROOFLINE_NOTICE).toContain("trademark of Arjun-Walia");
    expect(PROOFLINE_NOTICE).toContain("github.com/itsawesomeabhishek");
    expect(PROOFLINE_NOTICE).toContain("prior written permission");
  });

  it("is required by the running app, the manifest, and the license", () => {
    const layout = readFileSync(resolve(root, "src/app/layout.tsx"), "utf8");
    const home = readFileSync(resolve(root, "src/components/marketing/home.tsx"), "utf8");
    const manifest = readFileSync(resolve(root, "src/app/manifest.ts"), "utf8");
    const license = readFileSync(resolve(root, "LICENSE"), "utf8");
    const pkg = readFileSync(resolve(root, "package.json"), "utf8");

    expect(layout).toContain('from "@/lib/legal/trademark"');
    expect(layout).toContain("PROOFLINE_NOTICE");
    expect(home).toContain("PROOFLINE_NOTICE");
    expect(manifest).toContain('from "@/lib/legal/trademark"');
    expect(license).toContain("prior written permission");
    expect(license).toContain("github.com/itsawesomeabhishek");
    expect(license).toContain("Abhishek");
    expect(pkg).toContain('"UNLICENSED"');
    expect(pkg).toContain("itsawesomeabhishek");
  });
});