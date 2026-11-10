"use client";

import { useEffect } from "react";

type AnalyticsTrackerProps = {
  slug: string;
};

export default function AnalyticsTracker({ slug }: AnalyticsTrackerProps) {
  useEffect(() => {
    const sendEvent = (eventType: string, target: string | null = null) => {
      void fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, eventType, target }),
        keepalive: true,
      }).catch(() => {});
    };

    const params = new URLSearchParams(window.location.search);
    sendEvent("profile_view");

    if (params.get("source") === "qr") {
      sendEvent("qr_scan");
    }

    const handleClick = (event: MouseEvent) => {
      const element = event.target;
      if (!(element instanceof Element)) return;

      const link = element.closest("a[data-analytics-event]");
      if (!(link instanceof HTMLAnchorElement)) return;

      const eventType = link.dataset.analyticsEvent;
      const target = link.dataset.analyticsTarget ?? null;

      if (eventType === "contact_click" || eventType === "social_click") {
        sendEvent(eventType, target);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [slug]);

  return null;
}