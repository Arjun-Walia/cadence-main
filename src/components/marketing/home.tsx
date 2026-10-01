"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { PROOFLINE_NOTICE, PROOFLINE_RIGHTS_HOLDER } from "@/lib/legal/trademark";
import { motionTokens } from "@/lib/motion/tokens";

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#method", label: "Method" },
  { href: "#work", label: "What it runs" },
  { href: "#models", label: "Models" },
];

const OLD_WAY = [
  "Scroll the pipeline and guess who went quiet.",
  "The reason for calling lives in three different notes.",
  "A message goes out before anyone has approved it.",
];

const PROOFLINE_WAY = [
  "A short list, ranked from the deals you already have.",
  "Each pick names the value, the stage, and how long it has been quiet.",
  "Approve, snooze, or skip. Nothing is sent until you say so.",
];

const STEPS = [
  {
    n: "01",
    title: "Keep the deals you already have",
    body: "Contacts, stages, values, and notes stay the source. Proofline does not invent a lead.",
  },
  {
    n: "02",
    title: "See who to contact first",
    body: "Each morning you get a short list. The reason is the record, not a hunch.",
  },
  {
    n: "03",
    title: "You approve the next step",
    body: "Approve, snooze, or skip. The inbox, the pipeline, and WhatsApp wait for that decision.",
  },
];

const WORK = [
  {
    title: "Decisions",
    body: "The morning list. Open deals, ranked, with the records behind each pick.",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Inbox",
    body: "WhatsApp conversations in one place. Draft a reply with your own model key when you want one.",
    span: "",
  },
  {
    title: "Pipelines",
    body: "Stages, values, and notes you already trust. The ranker reads them. It does not replace them.",
    span: "",
  },
  {
    title: "Automations",
    body: "Steps you design. They run after the rules you set, and they can hand a chat back to a person.",
    span: "",
  },
  {
    title: "Flows",
    body: "Branching WhatsApp flows for the conversations that should not wait on a morning list.",
    span: "",
  },
  {
    title: "Broadcasts",
    body: "Templates to the audience you choose. A send still belongs to someone on the account.",
    span: "md:col-span-2",
  },
];

const MODELS = ["WhatsApp", "OpenAI", "Anthropic", "DeepSeek", "Groq", "Gemini"];

const FACTS = [
  { value: "3", label: "Choices on every pick", detail: "Approve, snooze, or skip." },
  { value: "0", label: "Leads invented", detail: "The source is your deals, stages, and notes." },
  { value: "1", label: "Gate before a send", detail: "Nothing goes out until you approve it." },
  { value: "5", label: "Model providers", detail: "Your key. Proofline does not resell a seat." },
];

const PREVIEW = [
  { name: "Harbor & Co", meta: "Proposal · quiet 6 days", value: "$48,000", tone: "First" },
  { name: "North glass", meta: "Negotiation · quiet 2 days", value: "$19,400", tone: "Next" },
  { name: "Field note", meta: "Discovery · quiet 11 days", value: "$7,200", tone: "Then" },
];

const HEADLINE = ["Decide", "who to", "contact", "first."];

const ease = motionTokens.easing.smooth;

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : motionTokens.distance.lg }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{
        duration: reduce ? 0.01 : motionTokens.duration.normal,
        ease,
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="min-h-screen bg-[#06070b] text-[#f5f7fb]">
      {!reduce && (
        <motion.div
          style={{ scaleX: bar }}
          className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-white"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 0.6px, transparent 0.6px)",
          backgroundSize: "3px 3px",
        }}
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06070b]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/home" className="flex shrink-0 items-center" aria-label="Proofline home">
            <Image
              src="/brand/logo-dark.png"
              alt="Proofline"
              width={793}
              height={692}
              priority
              className="h-14 w-auto sm:h-16"
              style={{ width: "auto" }}
            />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login" className="hidden px-3 py-2 text-sm text-white/70 hover:text-white sm:inline-flex">
              Sign in
            </Link>
            <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-[#06070b]"
              >
                Get started
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 -left-24 h-72 w-72 rounded-full bg-[#2f6df6]/20 blur-3xl"
          />
          <div>
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0.01 : motionTokens.duration.fast, ease }}
              className="text-xs font-semibold tracking-[0.28em] text-[#8eb6ff] uppercase"
            >
              Sales decisions
            </motion.p>
            <h1 className="mt-5 font-display text-[3.3rem] leading-[0.9] font-semibold tracking-[-0.045em] text-white sm:text-7xl lg:text-8xl">
              {HEADLINE.map((word, i) => (
                <motion.span
                  key={word}
                  className="mr-[0.22em] inline-block"
                  initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduce ? 0.01 : motionTokens.duration.slow,
                    ease,
                    delay: reduce ? 0 : 0.08 + i * 0.08,
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.45, duration: reduce ? 0.01 : 0.4 }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-white/62"
            >
              Your deals, stages, and notes are already there. Proofline ranks the open ones,
              shows the records behind each pick, and waits for you to approve.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.55, duration: reduce ? 0.01 : 0.4, ease }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#06070b]"
                >
                  Start with your deals
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </motion.div>
              <a
                href="#method"
                className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40"
              >
                See the method
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.7, ease, delay: reduce ? 0 : 0.2 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0e16] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
              <div className="flex h-56 items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(47,109,246,0.35),transparent_62%)]">
                <Image
                  src="/brand/mark-blue.png"
                  alt=""
                  width={745}
                  height={477}
                  className="h-36 w-auto"
                  style={{ width: "auto", height: "9rem" }}
                />
              </div>
              <div className="space-y-2 px-4 py-4">
                <div className="flex items-baseline justify-between gap-3 px-1">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                    This morning
                  </p>
                  <p className="text-[10px] tracking-[0.14em] text-white/35 uppercase">Sample preview</p>
                </div>
                {PREVIEW.map((row, i) => (
                  <motion.div
                    key={row.name}
                    initial={{ opacity: 0, x: reduce ? 0 : 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.45 + i * 0.08,
                      duration: reduce ? 0.01 : 0.4,
                      ease,
                    }}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{row.name}</p>
                      <p className="text-xs text-white/45">{row.meta}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{row.value}</p>
                      <p className="text-[10px] tracking-[0.16em] text-[#8eb6ff] uppercase">{row.tone}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section
          aria-label="Works with"
          className="overflow-hidden border-y border-white/10 py-4"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <motion.div
            className="flex w-max gap-12 pr-12"
            animate={reduce ? undefined : { x: ["0%", "-50%"] }}
            transition={reduce ? undefined : { duration: 28, ease: "linear", repeat: Infinity }}
          >
            {[...MODELS, ...MODELS].map((name, i) => (
              <span key={`${name}-${i}`} className="text-sm tracking-[0.22em] text-white/45 uppercase">
                {name}
              </span>
            ))}
          </motion.div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.22em] text-white/40 uppercase">The problem</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] font-semibold tracking-tight sm:text-6xl">
              The old way guesses. Proofline waits for you.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
                <p className="text-xs font-semibold tracking-[0.2em] text-white/35 uppercase">The old way</p>
                <ul className="mt-6 space-y-4">
                  {OLD_WAY.map((line) => (
                    <li key={line} className="text-lg text-white/45 line-through decoration-white/20">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded-[28px] bg-white p-8 text-[#12141a]">
                <p className="text-xs font-semibold tracking-[0.2em] text-black/45 uppercase">The Proofline way</p>
                <ul className="mt-6 space-y-4">
                  {PROOFLINE_WAY.map((line) => (
                    <li key={line} className="text-lg">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="method" className="border-y border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.22em] text-white/40 uppercase">Method</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl">Three steps. Then you decide.</h2>
            </Reveal>
            <ol className="mt-14">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.06}>
                  <li className="grid gap-4 border-t border-white/10 py-8 md:grid-cols-[8rem_1fr]">
                    <span className="font-display text-5xl font-semibold tracking-tight text-white/25">{step.n}</span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{step.title}</h3>
                      <p className="mt-3 max-w-2xl text-white/60">{step.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section id="work" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.22em] text-white/40 uppercase">What it runs</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              One approval. The rest of the desk stays put.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-3 md:grid-cols-4">
            {WORK.map((item, i) => (
              <Reveal key={item.title} delay={Math.min(i, 4) * 0.05} className={item.span}>
                <motion.article
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.sharp }}
                  className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{item.body}</p>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10">
          <div className="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((fact, i) => (
              <Reveal key={fact.label} delay={i * 0.05}>
                <div className="border-white/10 px-6 py-10 sm:border-l">
                  <p className="font-display text-6xl font-semibold tracking-tight">{fact.value}</p>
                  <p className="mt-3 text-sm font-medium">{fact.label}</p>
                  <p className="mt-1 text-sm text-white/45">{fact.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="models" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.22em] text-white/40 uppercase">Models</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              Your key. Five providers. No resold seat.
            </h2>
          </Reveal>
          <ul className="mt-12">
            {MODELS.slice(1).map((name, i) => (
              <Reveal key={name} delay={i * 0.04}>
                <li className="flex items-baseline justify-between border-b border-white/10 py-5">
                  <span className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{name}</span>
                  <span className="text-xs tracking-[0.18em] text-white/35 uppercase">Bring your key</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="px-4 pb-24 sm:px-6">
          <Reveal>
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[32px] bg-white px-8 py-14 text-[#12141a] md:flex-row md:items-center">
              <div>
                <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  Start from the deals you already have.
                </h2>
                <p className="mt-3 max-w-xl text-[#3c4250]">
                  No invented pipeline. A short list, the reason beside it, and a send that waits for you.
                </p>
              </div>
              <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#06070b] px-5 py-3 text-sm font-semibold whitespace-nowrap text-white"
                >
                  Create an account
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </motion.div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/home" aria-label="Proofline home">
              <Image
                src="/brand/logo-dark.png"
                alt="Proofline"
                width={793}
                height={692}
                className="h-20 w-auto"
                style={{ width: "auto", height: "5rem" }}
              />
            </Link>
            <div className="flex gap-5 text-sm text-white/50">
              <Link href="/login" className="hover:text-white">Sign in</Link>
              <Link href="/signup" className="hover:text-white">Get started</Link>
            </div>
          </div>
          <p className="max-w-3xl text-xs leading-relaxed text-white/35">{PROOFLINE_NOTICE}</p>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} {PROOFLINE_RIGHTS_HOLDER}</p>
        </div>
      </footer>
    </div>
  );
}
