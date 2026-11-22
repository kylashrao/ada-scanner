"use client";

import { useRef, useState, type FormEvent } from "react";

const standards = {
  wcag: "WCAG 2.1 Level AA",
  titleII: "ADA Title II · WCAG 2.1 Level AA",
  titleIII: "ADA Title III · WCAG 2.1 Level AA target",
};

const field = "mt-2 w-full rounded-lg border border-slate-500 bg-white px-3 py-2.5";
const secondary = "rounded-lg border border-indigo-700 px-3 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50";

export default function StatementBuilder() {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const output = useRef<HTMLHeadingElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? "").trim();
    const organization = read("organization");
    const website = read("website");
    const standard = read("standard") as keyof typeof standards;
    const email = read("email");
    const phone = read("phone");
    const feedback = read("feedback");

    if (!organization || !feedback || !Object.hasOwn(standards, standard)) {
      setError("Enter an organization name, target standard and feedback instructions.");
      return;
    }

    let url: URL | undefined;
    try { url = new URL(website); } catch { /* Invalid input is handled below. */ }
    if (!url || !["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      setError("Enter a website URL beginning with https:// or http://, without login details.");
      (event.currentTarget.elements.namedItem("website") as HTMLInputElement).focus();
      return;
    }
    if (!email && !phone) {
      setError("Enter at least one contact method, an email address or a phone number.");
      emailInput.current?.focus();
      return;
    }

    const target = {
      wcag: "Our accessibility target for this website is WCAG 2.1 Level AA.",
      titleII: "For web content covered by the ADA Title II web accessibility rule, our technical accessibility target is WCAG 2.1 Level AA.",
      titleIII: "In support of equal access to our goods and services under ADA Title III, we use WCAG 2.1 Level AA as our technical accessibility target.",
    }[standard];

    setDraft([
      "Accessibility Statement",
      `${organization} is committed to making ${url.href} accessible to people with disabilities. ${target}`,
      "Accessibility feedback and assistance",
      "If you encounter a barrier or need information in an accessible format, please contact us. Include the page address and a description of the problem if you can.",
      feedback,
      [email && `Email: ${email}`, phone && `Phone: ${phone}`].filter(Boolean).join("\n"),
    ].join("\n\n"));
    requestAnimationFrame(() => output.current?.focus());
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setNotice("Statement copied.");
    } catch {
      setNotice("Clipboard access was unavailable. Select the statement text or download it.");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([draft + "\n"], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "accessibility-statement.txt";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Statement download started.");
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2 print:block">
      <form onSubmit={generate} onChange={() => { setDraft(""); setError(""); setNotice(""); }} className="min-w-0 space-y-5 rounded-2xl border border-slate-300 bg-white p-5 sm:p-7 print:hidden">
        <div>
          <label className="block font-semibold" htmlFor="organization">Business or organization name</label>
          <input id="organization" name="organization" className={field} maxLength={200} required />
        </div>
        <div>
          <label className="block font-semibold" htmlFor="website">Website URL</label>
          <input id="website" name="website" type="url" className={field} placeholder="https://example.com" maxLength={2048} required />
        </div>
        <div>
          <label className="block font-semibold" htmlFor="standard">Target standard</label>
          <select id="standard" name="standard" className={field}>
            {Object.entries(standards).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="font-semibold">Accessibility contact</legend>
          <p id="contact-hint" className="mt-1 text-sm text-slate-700">Provide at least one contact method.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label htmlFor="email">Email <input ref={emailInput} id="email" name="email" type="email" className={field} maxLength={254} aria-describedby="contact-hint" /></label>
            <label htmlFor="phone">Phone <input id="phone" name="phone" type="tel" className={field} maxLength={80} aria-describedby="contact-hint" /></label>
          </div>
        </fieldset>
        <div>
          <label className="block font-semibold" htmlFor="feedback">Feedback instructions</label>
          <p id="feedback-hint" className="mt-1 text-sm text-slate-700">Describe how people can report a barrier or request an accessible format. Include a feedback form URL if you have one.</p>
          <textarea id="feedback" name="feedback" className={field} rows={4} maxLength={2000} aria-describedby="feedback-hint" required />
        </div>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 font-medium text-rose-900">{error}</p>}
        <button type="submit" className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800">Generate statement</button>
      </form>
      <section aria-labelledby="statement-preview" className="min-w-0 rounded-2xl border border-slate-300 bg-white p-5 sm:p-7 print:border-0 print:p-0">
        <h2 id="statement-preview" ref={output} tabIndex={-1} className="text-xl font-bold print:hidden">Statement preview</h2>
        {draft ? <>
          <div className="statement-print mt-4 rounded-lg bg-slate-50 p-4 print:mt-0 print:bg-white print:p-0">
            {draft.split("\n\n").map((paragraph, index) => {
              if (index === 0) return <h3 key={index} className="text-lg font-bold">{paragraph}</h3>;
              if (index === 2) return <h4 key={index} className="mt-4 font-bold">{paragraph}</h4>;
              return <p key={index} className="mt-3 whitespace-pre-wrap wrap-anywhere">{paragraph}</p>;
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={copy} className={secondary}>Copy statement</button>
            <button type="button" onClick={() => window.print()} className={secondary}>Print / Save PDF</button>
            <button type="button" onClick={download} className={secondary}>Download text</button>
          </div>
        </> : <p className="mt-3 text-slate-700">Fill in the form and generate a draft to preview it here.</p>}
        <p role="status" className="mt-3 text-sm font-semibold text-slate-700 print:hidden">{notice}</p>
      </section>
    </div>
  );
}
