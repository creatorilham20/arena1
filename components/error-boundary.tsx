"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; msg: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, msg: "" };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, msg: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", err.message, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-3xl">&#9888;</div>
        <h2 className="text-base font-semibold">Terjadi kesalahan</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Bagian ini gagal dimuat. Data lain tetap aman. Tutup PIN lalu buka
          lagi, atau muat ulang.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Muat ulang
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
