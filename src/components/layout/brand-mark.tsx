import { cn } from "@/lib/utils";

/**
 * Monochrome wordmark tile, in the same family as a black rounded
 * square with a heavy white letter. The tile uses the current
 * foreground color so it stays visible in light and dark mode.
 */
export function BrandMark({
  className,
  title = "Proofline",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-[22%] bg-foreground text-background",
        className,
      )}
    >
      <BrandGlyph className="h-[62%] w-[62%]" />
    </span>
  );
}

export function BrandGlyph({
  className,
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill={color}
      aria-hidden
      className={className}
    >
      <path d="M23.6 8.2A10.2 10.2 0 1 0 23.6 23.8L20.8 20.4A5.8 5.8 0 1 1 20.8 11.6Z" />
    </svg>
  );
}
