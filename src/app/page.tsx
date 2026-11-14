// Copyright 2026 geksevence
"use client";

import { useState } from "react";
import type { Analysis } from "@/lib/analysis";

type Severity = "Critical" | "High" | "Medium" | "Low";

export default function Home() {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Severity>("High");
  const [service, setService] = useState("AWS IAM");
  const [id, setId] = useState("TEST-001");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          severity,
          service,
          id,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      if (!data.analysis || typeof data.analysis.summary !== "string") {
        throw new Error("The server returned an unexpected response.");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this finding."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-600">
          CLOUD SECURITY · AI ADVISOR
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Analyze a Security Finding
        </h1>
        <p className="mt-3 text-gray-600">
          Submit a synthetic cloud security finding to receive
          an explanation, verification steps, and prioritized
          remediation recommendations.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border p-6 shadow-sm"
      >
        <div>
          <label htmlFor="title" className="mb-1 block font-medium">
            Finding title
          </label>
          <input
            id="title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. IAM role has excessive permissions"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="severity" className="mb-1 block font-medium">
              Severity
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="service" className="mb-1 block font-medium">
              AWS service
            </label>
            <select
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option>AWS IAM</option>
              <option>Amazon S3</option>
              <option>AWS CloudTrail</option>
              <option>Amazon EC2</option>
              <option>Amazon GuardDuty</option>
              <option>AWS Security Hub</option>
              <option>Amazon EKS</option>
              <option>Other AWS service</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="id" className="mb-1 block font-medium">
            Finding ID
          </label>
          <input
            id="id"
            required
            maxLength={100}
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block font-medium"
          >
            Finding description
          </label>
          <textarea
            id="description"
            required
            minLength={1}
            maxLength={3000}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the suspected security issue and available evidence..."
            className="w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-sm text-gray-500">
            Do not include credentials, secrets, or sensitive production data.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analyzing finding..." : "Analyze Security Finding"}
        </button>

        {error && (
          <div role="alert" className="rounded-md bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}
      </form>

      {analysis && (
        <section aria-live="polite" className="mt-8 space-y-6 rounded-xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">AI Security Analysis</h2>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${riskStyles[analysis.assessedRisk]}`}
            >
              Assessed risk: {analysis.assessedRisk}
            </span>
          </div>

          <p className="leading-7">{analysis.summary}</p>
          <p className="text-sm text-gray-600">{analysis.riskRationale}</p>

          <List title="Potential impact" items={analysis.potentialImpact} />

          <div className="grid gap-6 sm:grid-cols-2">
            <List title="Verified from the finding" items={analysis.verifiedFacts} />
            <List title="Assumptions to confirm" items={analysis.assumptions} />
          </div>

          {analysis.evidenceToVerify.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Evidence to verify</h3>
              <ul className="space-y-2">
                {analysis.evidenceToVerify.map((item, i) => (
                  <li key={i} className="rounded-md bg-gray-50 p-3">
                    <p className="font-medium">{item.check}</p>
                    <p className="mt-1 font-mono text-sm text-gray-700 break-words">{item.howTo}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-2 font-semibold">Remediation steps (in priority order)</h3>
            <ol className="space-y-3">
              {analysis.remediationSteps.map((step, i) => (
                <li key={i} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {i + 1}. {step.action}
                    </p>
                    <span className="shrink-0 text-xs text-gray-500">Effort: {step.effort}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{step.rationale}</p>
                </li>
              ))}
            </ol>
          </div>

          <List title="How to confirm the fix" items={analysis.validationSteps} />

          <p className="border-t pt-4 text-sm text-gray-500">
            AI-generated recommendations require human review.
            No live AWS environment was inspected by this demo.
          </p>
        </section>
      )}
    </main>
  );
}



const riskStyles: Record<Analysis["assessedRisk"], string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
