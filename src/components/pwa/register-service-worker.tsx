"use client";

import { useEffect } from "react";

/** Registers the installable app worker on the live site, not in local dev. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Install support is optional if the browser refuses the worker.
    });
  }, []);

  return null;
}
