"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "proofline.install.dismissed";

function subscribe() {
  return () => {};
}

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

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const standalone = useSyncExternalStore(subscribe, isStandalone, () => false);
  const ios = useSyncExternalStore(subscribe, isIosSafari, () => false);
  const dismissed = useSyncExternalStore(subscribe, wasDismissed, () => false);
  const [hidden, setHidden] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private mode can reject storage; hiding for this visit is enough.
    }
    setHidden(true);
    setDeferred(null);
  };

  if (standalone || dismissed || hidden || (!deferred && !ios)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:px-6">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg">
        <Image
          src="/brand/mark-blue.png"
          alt=""
          width={745}
          height={477}
          className="size-10 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Install Proofline</p>
          <p className="text-xs text-muted-foreground">
            {deferred ? (
              "Add it to your home screen and open it like an app."
            ) : (
              <span className="inline-flex items-center gap-1">
                Tap <Share className="size-3" aria-hidden /> then Add to Home Screen.
              </span>
            )}
          </p>
        </div>
        {deferred ? (
          <button
            type="button"
            className={cn(buttonVariants({ size: "sm" }))}
            onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice;
              dismiss();
            }}
          >
            <Download className="size-4" aria-hidden />
            Install
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
