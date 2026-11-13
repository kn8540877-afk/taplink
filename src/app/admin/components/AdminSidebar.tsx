"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const navigation = [
  { href: "#overview", id: "overview", number: "01", label: "Overview" },
  { href: "#users", id: "users", number: "02", label: "User Management" },
  { href: "#profiles", id: "profiles", number: "03", label: "Profile Management" },
  { href: "#subscription-history", id: "subscription-history", number: "04", label: "Subscription History" },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const menu = menuRef.current;
    const menuButton = menuButtonRef.current;
    if (!menu) return;

    const focusable = menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable[0]?.focus();

    function handleMenuKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleMenuKeyDown);
    return () => {
      document.removeEventListener("keydown", handleMenuKeyDown);
      menuButton?.focus();
    };
  }, [isOpen]);
  useEffect(() => {
    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0c1424] px-5 py-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 font-black text-white">
            T
          </span>
          <span>
            <span className="block text-sm font-bold tracking-[0.15em] text-white">
              TAPLINK
            </span>
            <span className="block text-[9px] font-bold tracking-[0.18em] text-blue-400">
              ADMIN CONSOLE
            </span>
          </span>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          aria-controls="admin-sidebar"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-xl text-slate-200 transition hover:border-blue-400/40 hover:text-blue-300"
        >
          {isOpen ? "×" : "☰"}
        </button>
      </div>

      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        ref={menuRef}
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.07] bg-[#0c1424] transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/[0.07] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-black text-white shadow-lg shadow-blue-500/20">
            T
          </div>
          <div>
            <p className="text-lg font-bold tracking-[0.16em] text-white">
              TAPLINK
            </p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-400">
              ADMIN CONSOLE
            </p>
          </div>
        </div>

        <div className="flex-1 px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border border-blue-400/20 bg-blue-500/10 text-blue-300"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-xs">
                    {item.number}
                  </span>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/[0.07] p-4">
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              <span className="text-xs font-semibold text-emerald-300">
                System Protected
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              Administrator access verified.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
