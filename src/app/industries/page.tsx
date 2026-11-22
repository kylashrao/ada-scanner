import { siteUrl } from "../../lib/site";
import Link from "next/link";
import industries from "../../../data/industries.json";
import { complianceHref } from "../../lib/industries";

export const metadata = { alternates: { canonical: siteUrl("/industries") }, title: "Industry accessibility guides" };

export default function Industries() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Industry accessibility guides</h1>
      <p className="mt-3 max-w-2xl text-slate-700">Find accessibility barriers and remediation steps for specific industries and platforms.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <li key={industry.slug} className="rounded-xl border border-slate-300 bg-white p-5">
            <Link className="font-bold text-indigo-800 underline" href={complianceHref(industry.slug)}>{industry.name}</Link>
            <p className="mt-2 text-sm text-slate-700">{industry.riskContext}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
