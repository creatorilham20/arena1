"use client";

import { useEffect, useRef, useState } from "react";

export default function Splash({ businessName }: { businessName: string }) {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("ibm-splash-done") === "1") return;
    done.current = true;
    setShow(true);
    const t = setTimeout(() => finish(), 2800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    setLeaving(true);
    setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("ibm-splash-done", "1");
    }, 450);
  };

  if (!show) return null;

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 shadow-2xl shadow-black/20 backdrop-blur">
        <span className="text-4xl font-extrabold tracking-tight">{businessName.slice(0, 1)}</span>
        <span className="absolute inset-0 animate-ping rounded-3xl bg-white/10" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{businessName}</h1>
        <p className="mt-1 text-sm text-white/70">Satu kendali untuk semua bisnis</p>
      </div>
      <div className="h-1 w-36 overflow-hidden rounded-full bg-white/20">
        <div className="h-full animate-[splashbar_1.6s_ease-out_forwards] rounded-full bg-white" style={{ width: "0%" }} />
      </div>
      <p className="text-[11px] text-white/50">Ketuk untuk lewati</p>
      <style jsx global>{`
        @keyframes splashbar { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
}