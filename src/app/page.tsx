
"use client";

import { useState } from "react";

const finding = {
  title: "S3 bucket may allow public access",
  severity: "High",
  service: "Amazon S3",
  id: "S3-PUBLIC-001",
  description:
    "A sample finding indicates that a storage bucket may allow public access. Verify the bucket policy, Block Public Access settings, and business requirements before making changes.",
};

export default function Home() {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeFinding() {
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finding),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-cyan-400">
          CLOUD SECURITY AI ADVISOR
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Cloud security, made actionable.
        </h1>

        <p className="mt-3 text-slate-300">
          Analyze sample cloud findings and understand the
          recommended next steps.
        </p>

        <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-400">
              {finding.service} · {finding.id}
            </span>
            <span className="rounded-full bg-red-950 px-3 py-1 text-sm text-red-300">
              {finding.severity} risk
            </span>
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            {finding.title}
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            {finding.description}
          </p>

          <button
            onClick={analyzeFinding}
            disabled={loading}
            className="mt-6 rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze finding with AI"}
          </button>

          {error && (
            <p role="alert" className="mt-4 text-red-300">
              {error}
            </p>
          )}

          {analysis && (
            <div className="mt-6 whitespace-pre-wrap rounded-lg bg-slate-800 p-5 leading-7 text-slate-100">
              <h3 className="mb-3 font-semibold text-cyan-300">
                AI analysis
              </h3>
              {analysis}
            </div>
          )}
        </section>

        <p className="mt-6 text-sm text-slate-500">
          Portfolio prototype. Uses synthetic findings, not a live
          cloud security scanner. Recommendations require human review.
        </p>
      </div>
    </main>
  );
}

