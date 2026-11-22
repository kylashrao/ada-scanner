import { siteUrl } from "../../lib/site";
import rules from "../../../data/wcag_rules.json";

export const metadata = { alternates: { canonical: siteUrl("/rules") }, title: "WCAG 2.1 rules and US ADA guidance" };

export default function Rules() {
  return (
    <article className="mx-auto max-w-4xl space-y-6 px-5 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">WCAG 2.1 rule reference</h1>
      <p className="text-slate-700">These checks and remediation examples cover selected Level A and AA criteria. <a className="text-indigo-800 underline" href="https://www.w3.org/TR/WCAG21/">Read the full W3C standard.</a></p>
      <section id="ada" className="space-y-3 rounded-xl border border-slate-300 bg-white p-5">
        <h2 className="text-xl font-bold">US ADA accessibility requirements</h2>
        <p>ADA Title II (28 CFR Part 35) covers state and local government services. Its web and mobile accessibility rule adopts WCAG 2.1 Level AA. The April 2026 DOJ interim final rule moved the original 2026 deadline for covered entities with populations of 50,000 or more to April 26, 2027. The deadline for smaller entities and special district governments moved to April 26, 2028. <a className="text-indigo-800 underline" href="https://www.ada.gov/resources/small-entity-compliance-guide/">DOJ Title II compliance guide</a></p>
        <p>ADA Title III covers places of public accommodation and requires equal access to their goods and services. DOJ guidance addresses web accessibility for businesses open to the public. The dates above apply to the Title II rule. <a className="text-indigo-800 underline" href="https://www.ada.gov/resources/web-guidance/">DOJ web accessibility guidance</a></p>
      </section>
      <section id="monitoring" className="space-y-3 rounded-xl border border-emerald-700 bg-emerald-50 p-5">
        <h2 className="text-xl font-bold">Accessibility monitoring for teams</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Inventory your highest-use page templates and journeys, including hosted checkout or appointment tools. Assign an owner to each.</li>
          <li>Record the URL, rule, location and reproducible steps for each finding. Prioritize barriers that block common tasks and assign a remediation deadline.</li>
          <li>Scan the same public pages after template, CMS or vendor changes. Compare findings by rule and location, and manually verify affected journeys with a keyboard and screen reader.</li>
          <li>Review unresolved issues and user feedback regularly. Update the accessibility statement when contact details or known limitations change.</li>
        </ol>
      </section>
      <ul className="space-y-4">
        {rules.map((rule) => (
          <li key={rule.id} className="rounded-xl border border-slate-300 bg-white p-5">
            <h2 className="text-xl font-bold">{rule.title}</h2>
            <p className="mt-1 text-sm font-semibold text-indigo-800">WCAG {rule.criterion} · Level {rule.level}</p>
            <p className="mt-2">{rule.rationale}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">{rule.remediation.map((step) => <li key={step}>{step}</li>)}</ol>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap wrap-anywhere rounded-lg bg-slate-950 p-3 text-sm text-slate-100"><code>{rule.example}</code></pre>
          </li>
        ))}
      </ul>
    </article>
  );
}
