import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Keep the deals you already have",
    body: "Contacts, stages, values, and notes stay the source. Proofline does not invent a lead.",
  },
  {
    n: "02",
    title: "See who to contact first",
    body: "Each morning you get a short list. The reason names the value, the stage, and how long it has been quiet.",
  },
  {
    n: "03",
    title: "You approve the next step",
    body: "Approve, snooze, or skip. Nothing is sent until you say so.",
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2" aria-label="Proofline home">
            <BrandMark />
            <span className="font-display text-[15px] font-semibold tracking-tight">
              Proofline
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ModeToggle />
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
            >
              Sign in
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-5 py-20">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Sales decisions
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Decide who to contact first.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Your deals, stages, and notes are already there. Proofline ranks the open ones,
            shows the records behind each pick, and waits for you to approve.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Start with your deals <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="text-xs font-semibold text-muted-foreground">{step.n}</p>
                <h2 className="mt-2 font-display text-lg font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground">Proofline</span>
          <span>© {new Date().getFullYear()} Proofline</span>
        </div>
      </footer>
    </div>
  );
}
