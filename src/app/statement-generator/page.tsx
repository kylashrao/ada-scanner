import { siteUrl } from "../../lib/site";
import type { Metadata } from "next";
import StatementBuilder from "../../components/StatementBuilder";

export const metadata: Metadata = {
  alternates: { canonical: siteUrl("/statement-generator") },
  title: "Accessibility statement generator",
  description: "Draft a website accessibility statement with your WCAG 2.1 Level AA target, ADA context and feedback details.",
};

export default function StatementGenerator() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 print:max-w-none print:p-0">
      <div className="mb-7 max-w-3xl print:hidden">
        <h1 className="text-4xl font-bold tracking-tight">Accessibility statement generator</h1>
        <p className="mt-3 text-lg text-slate-700">Draft a public statement that explains your accessibility target and how people can report barriers or request assistance.</p>
        <p className="mt-3 text-sm text-slate-700">Review the draft before publishing. Add any known limitations and describe the steps your team actually takes. The draft is informational and does not constitute legal advice or certification.</p>
      </div>
      <StatementBuilder />
    </div>
  );
}
