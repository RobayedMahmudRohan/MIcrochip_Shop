"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

// Account drawer for the signed-in user. Built on a modal <dialog>, so the
// browser handles the top layer (above the header), Escape, making the page
// behind it inert, and keeping Tab focus inside. Slide/fade styles live in
// globals.css (`.profile-drawer`).

type ProfileDrawerProps = {
  name: string;
  email: string | null;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const items = [
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
  {
    href: "/orders",
    label: "My Orders",
    icon: (
      <>
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </>
    ),
  },
  {
    href: "/saved-builds",
    label: "Saved Builds",
    icon: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
] as const;

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 1);
  return letters.toUpperCase();
}

function Avatar({ name, size }: { name: string; size: "sm" | "lg" }) {
  const sizing = size === "lg" ? "h-12 w-12 text-base" : "h-7 w-7 text-xs";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ${sizing}`}
    >
      {initials(name)}
    </span>
  );
}

export function ProfileDrawer({ name, email }: ProfileDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const titleId = useId();
  const drawerId = useId();

  const firstName = name.trim().split(/\s+/)[0];

  function openDrawer() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function closeDrawer() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDrawer}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={drawerId}
        className={`flex cursor-pointer items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2 text-muted transition-colors hover:text-primary ${focusRing}`}
      >
        <Avatar name={name} size="sm" />
        <span>
          Hi, <span className="text-foreground">{firstName}</span>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        id={drawerId}
        aria-labelledby={titleId}
        // Escape (the native `cancel` event) and close() both end up here.
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        // The panel fills the dialog box, so a click whose target is the
        // dialog itself landed on the ::backdrop.
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer();
        }}
        className="profile-drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(24rem,calc(100vw-3rem))] max-w-none overflow-hidden border-0 border-l border-border bg-surface p-0 text-foreground shadow-2xl"
      >
        <div className="flex h-full flex-col">
          <div className="relative flex items-center gap-4 border-b border-border px-6 py-6 pr-14">
            <Avatar name={name} size="lg" />
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-base font-semibold tracking-tight">
                {name}
              </h2>
              {email ? <p className="truncate text-sm text-muted">{email}</p> : null}
            </div>
            <button
              type="button"
              autoFocus
              onClick={closeDrawer}
              aria-label="Close account menu"
              className={`absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-foreground ${focusRing}`}
            >
              <Icon>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </Icon>
            </button>
          </div>

          <nav aria-label="Account" className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const current = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeDrawer}
                      aria-current={current ? "page" : undefined}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${focusRing} ${
                        current
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-background hover:text-primary"
                      }`}
                    >
                      <span className={current ? "text-primary" : "text-muted group-hover:text-primary"}>
                        <Icon>{item.icon}</Icon>
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0 text-muted opacity-60"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border p-3">
            <LogoutButton
              pendingLabel="Signing out…"
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
            >
              <Icon>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </Icon>
              Sign out
            </LogoutButton>
          </div>
        </div>
      </dialog>
    </>
  );
}
