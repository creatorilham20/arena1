"use client";

import { useEffect } from "react";

const SERVICE_WORKER_PATH = "/sw.js";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isSecureContext = window.location.protocol === "https:" || window.location.hostname === "localhost";
    if (!isSecureContext) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" });
        await registration.update();
      } catch {
        // Ignore registration errors in unsupported or restricted environments.
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}