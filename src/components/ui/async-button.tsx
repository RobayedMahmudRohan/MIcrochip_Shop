"use client";

import { useEffect, useState } from "react";

type ButtonState = "idle" | "loading" | "success" | "error";

type AsyncButtonProps = {
  onAction: () => Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
};

export function AsyncButton({
  onAction,
  disabled = false,
  children,
}: AsyncButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");

  useEffect(() => {
    if (state !== "success" && state !== "error") {
      return;
    }

    const timer = window.setTimeout(() => {
      setState("idle");
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [state]);

  async function handleClick() {
    if (state === "loading" || disabled) {
      return;
    }

    setState("loading");

    try {
      await onAction();
      setState("success");
    } catch {
      setState("error");
    }
  }

  const label =
    state === "loading"
      ? "Sending..."
      : state === "success"
        ? "✓ Sent"
        : state === "error"
          ? "↻ Retry"
          : children;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || state === "loading"}
      aria-live="polite"
      className={`min-w-[96px] rounded-lg px-4 py-2 text-sm font-medium text-white
        transition-[transform,opacity,background-color] duration-200 ease-out
        hover:-translate-y-0.5 active:translate-y-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500
        disabled:cursor-not-allowed disabled:opacity-60
        ${
          state === "error"
            ? "animate-[shake_300ms_ease-in-out] bg-red-600"
            : state === "success"
              ? "bg-emerald-600"
              : "bg-slate-800 hover:bg-slate-700"
        }`}
    >
      <span className="inline-block transition-opacity duration-200">
        {label}
      </span>
    </button>
  );
}