"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { scanDisclaimer } from "../lib/disclaimer";
import type { auditHtml } from "../lib/wcagAuditor";

type Audit = ReturnType<typeof auditHtml>;
type Mode = "url" | "html";
type Severity = keyof Audit["severityCounts"];
type Context = { name: string; guideHref: string; example: string };

const severities = ["critical", "serious", "moderate", "minor"] as const;
const severityStyles = {
  critical: "border-rose-200 bg-rose-50 text-rose-950",
  serious: "border-amber-200 bg-amber-50 text-amber-950",
  moderate: "border-indigo-200 bg-indigo-50 text-indigo-950",
  minor: "border-slate-200 bg-slate-100 text-slate-950",
};

export default function ScannerWidget({ context }: { context?: Context }) {
  const id = useId();
  const [mode, setMode] = useState<Mode>("url");
  const [values, setValues] = useState({ url: "", html: "" });
  const [audit, setAudit] = useState<Audit>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [notice, setNotice] = useState("");
  const findings = audit?.findings.filter((finding) => filter === "all" || finding.severity === filter) ?? [];

  async function copyFix(example: string, title: string) {
    try {
      await navigator.clipboard.writeText(example);
      setNotice(`Copied the fix for ${title.toLowerCase()}.`);
    } catch {
      setNotice("Clipboard access was unavailable. Select and copy the code directly.");
    }
  }

  async function scan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAudit(undefined);
    setFilter("all");
    setNotice("");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [mode]: values[mode] }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(result?.error ?? "The scan could not be completed. Please try again.");
      }
      setAudit(result);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The scan could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = "mt-2 w-full rounded-lg border border-slate-500 bg-white px-4 py-3 placeholder:text-slate-500";

  return (
    <section aria-labelledby={id + "-heading"} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-8">
      <h2 id={id + "-heading"} className="text-2xl font-bold">{context ? `Scan your ${context.name} page` : "Run an accessibility scan"}</h2>
      <p className="mt-2 text-slate-700">{context?.example ?? "Enter a public URL or paste the HTML you want to review."}</p>
      <form onSubmit={scan} className="mt-5 space-y-5">
        <fieldset disabled={busy}>
          <legend className="mb-2 text-sm font-semibold">Input type</legend>
          <div className="flex flex-wrap gap-3">
            {(["url", "html"] as const).map((choice) => (
              <label key={choice} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${mode === choice ? "border-indigo-600 bg-indigo-50 text-indigo-950" : "border-slate-400"}`}>
                <input name="mode" type="radio" className="accent-indigo-700" checked={mode === choice} onChange={() => { setMode(choice); setAudit(undefined); setError(""); setNotice(""); }} />
                {choice === "url" ? "Scan Live URL" : "Paste HTML"}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor={id + "-input"} className="text-sm font-bold">{mode === "url" ? "Public page URL" : "Page HTML"}</label>
          {mode === "url" ? (
            <input id={id + "-input"} className={fieldStyle} placeholder="https://example.com" inputMode="url" autoCapitalize="none" spellCheck={false} required maxLength={2048} disabled={busy} value={values.url} onChange={(event) => setValues({ ...values, url: event.target.value })} />
          ) : (
            <textarea id={id + "-input"} className={fieldStyle + " font-mono"} rows={7} required disabled={busy} value={values.html} onChange={(event) => setValues({ ...values, html: event.target.value })} />
          )}
        </div>
        <button type="submit" disabled={busy} className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 disabled:bg-slate-700">Scan accessibility</button>
      </form>
      <div role="status" className="mt-3 text-sm font-semibold text-slate-700">{busy ? "Scanning…" : audit ? `Scan complete. Score ${audit.score} out of 100.` : ""}</div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 font-medium text-red-900">{error}</p>}
      {audit && (
        <section aria-labelledby={id + "-results"} className="mt-7 border-t border-slate-300 pt-6">
          <h3 id={id + "-results"} className="text-xl font-bold">Audit results</h3>
          <div className="mt-3 max-w-sm">
            <label htmlFor={id + "-score"} className="block text-sm font-semibold text-slate-700">Accessibility score</label>
            <p className="text-4xl font-bold text-emerald-800">{audit.score}<span className="text-base text-slate-700"> / 100</span></p>
            <meter id={id + "-score"} min={0} max={100} value={audit.score} className="mt-2 h-4 w-full accent-emerald-700" />
          </div>
          <p className="mt-2 text-sm text-slate-700">The score starts at 100 and deducts points based on severity, up to five occurrences per rule. Manual review findings carry no point deduction.</p>
          <dl className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {severities.map((severity) => (
              <div key={severity} className={`rounded-lg border p-3 ${severityStyles[severity]}`}><dt className="text-sm font-semibold capitalize">{severity}</dt><dd className="text-xl font-bold">{audit.severityCounts[severity]}</dd></div>
            ))}
          </dl>
          {audit.findings.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label htmlFor={id + "-filter"} className="text-sm font-semibold">Filter findings</label>
              <select id={id + "-filter"} value={filter} onChange={(event) => { setFilter(event.target.value as Severity | "all"); setNotice(""); }} className="rounded-lg border border-slate-500 bg-white px-3 py-2 capitalize">
                <option value="all">All severities</option>
                {severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
              </select>
              <p role="status" className="text-sm text-slate-700">{findings.length} {findings.length === 1 ? "check" : "checks"} shown</p>
            </div>
          )}
          {findings.length === 0 && <p>{filter === "all" ? "No findings from the automated checks." : "No findings match this severity."}</p>}
          <ul className="space-y-3">
            {findings.map((finding) => (
              <li key={finding.id}>
                <details className="rounded-lg border border-slate-300 bg-white p-4">
                  <summary className="cursor-pointer font-semibold">{finding.title} ({finding.count}) <span className="text-sm font-normal text-slate-700">· {finding.manualReview ? "Manual review" : finding.severity}</span></summary>
                  <p className="mt-3 text-sm text-slate-700">WCAG {finding.criterion} · Level {finding.level}</p>
                  <p className="mt-2">{finding.rationale}</p>
                  {finding.locations.length > 0 && <p className="mt-2 break-words">Locations: {finding.locations.join(", ")}</p>}
                  <ol className="mt-2 list-decimal space-y-1 pl-5">{finding.remediation.map((step) => <li key={step}>{step}</li>)}</ol>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap wrap-anywhere rounded-lg bg-slate-950 p-3 text-sm text-slate-100"><code>{finding.example}</code></pre>
                  <button type="button" onClick={() => copyFix(finding.example, finding.title)} className="mt-3 rounded-lg border border-indigo-700 px-3 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50">Copy fix</button>
                </details>
              </li>
            ))}
          </ul>
          <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{notice}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <h4 className="font-bold text-indigo-950">Plan remediation</h4>
              <p className="mt-1 text-sm text-indigo-950">{context ? `Use the ${context.name} checklist to assign fixes and test the affected workflow.` : "Give your team a checklist for fixing the affected templates and workflows."}</p>
              <Link href={context?.guideHref ?? "/industries"} className="mt-3 inline-block text-sm font-bold text-indigo-800 underline">Open remediation guide</Link>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h4 className="font-bold text-emerald-950">Set up team monitoring</h4>
              <p className="mt-1 text-sm text-emerald-950">Define which pages to retest after releases and who owns manual verification.</p>
              <Link href="/rules#monitoring" className="mt-3 inline-block text-sm font-bold text-emerald-900 underline">Build a monitoring routine</Link>
            </div>
          </div>
        </section>
      )}
      <p className="mt-5 rounded-lg bg-slate-100 p-4 text-sm text-slate-800">{scanDisclaimer}</p>
    </section>
  );
}
