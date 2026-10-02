import Image from "next/image";

import { cn } from "@/lib/utils";

/** Blue Proofline mark for dark and light UI. The wordmark lives in logo-dark.png. */
export function BrandMark({
  className,
  title = "Proofline",
  priority = false,
}: {
  className?: string;
  title?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/mark-blue.png"
      alt={title}
      width={745}
      height={477}
      priority={priority}
      className={cn("inline-block size-7 shrink-0 object-contain", className)}
    />
  );
}
