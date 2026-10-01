"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Share } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Android/.test(ua);
  return isIos && isSafari;
}

export function InstallAppButton({
  size = "lg",
  variant = "default",
  className,
}: {
  size?: "sm" | "lg";
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIosSafari());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const classes = cn(
    buttonVariants({ variant, size }),
    size === "lg" && "h-11 px-5",
    className,
  );

  if (standalone) {
    return (
      <Link href="/dashboard" className={classes}>
        Open app
      </Link>
    );
  }

  if (deferred) {
    return (
      <button
        type="button"
        className={classes}
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
      >
        <Download className="size-4" aria-hidden />
        Install app
      </button>
    );
  }

  return (
    <Link href="/#install" className={classes}>
      {ios ? <Share className="size-4" aria-hidden /> : <Download className="size-4" aria-hidden />}
      {size === "sm" ? "Install" : ios ? "Install on iPhone" : "Install app"}
    </Link>
  );
}
