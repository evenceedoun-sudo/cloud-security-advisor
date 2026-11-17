"use client";
import { useReportWebVitals } from "next/web-vitals";
// Logs each Web Vital (LCP, INP, CLS, FCP, TTFB) for this visit to the browser console.
export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log("[web-vitals]", metric);
  });
  return null;
}
