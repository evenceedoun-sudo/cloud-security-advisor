"use client";
import { useReportWebVitals } from "next/web-vitals";

// The five Core Web Vitals. Next.js also reports its own timings, which we skip.
const CORE_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

// Reports each Web Vital for this visit to /api/vitals, which writes it to
// Runtime Logs. Also logs to the browser console during development.
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[web-vitals]", metric);
    }
    if (!CORE_METRICS.has(metric.name)) return;

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      path: window.location.pathname,
    });

    // sendBeacon still delivers when the tab is closing, which is when
    // LCP, INP and CLS are usually final. Fall back to a keepalive fetch.
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/vitals", blob)) {
      fetch("/api/vitals", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  });
  return null;
}
