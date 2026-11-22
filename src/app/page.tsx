import Link from "next/link";
import { siteUrl } from "../lib/site";
import ScannerWidget from "../components/ScannerWidget";
import { complianceHref, featuredIndustries } from "../lib/industries";

export const metadata = { alternates: { canonical: siteUrl("/") } };

export default function Home() {
  return (
    <>
      <section className="dark-surface bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-24 sm:px-8 sm:pt-16 sm:pb-28">
          <p className="mb-4 text-sm font-semibold text-emerald-300">WCAG 2.1 Level A &amp; AA</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Website accessibility scanner</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">Scan a public page or paste HTML to find accessibility barriers and see code examples for fixing them.</p>
        </div>
      </section>
      <div className="relative mx-auto -mt-14 max-w-6xl space-y-10 px-5 pb-16 sm:px-8">
        <ScannerWidget />
        <section aria-labelledby="ada-overview">
          <h2 id="ada-overview" className="text-2xl font-bold tracking-tight">US ADA website accessibility</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6">
              <h3 className="text-lg font-bold">Title II · State and local government</h3>
              <p className="mt-2 text-slate-700">The web and mobile app rule under 28 CFR Part 35 adopts WCAG 2.1 Level AA for covered content. The DOJ extended the original deadlines in April 2026.</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div><dt className="inline font-bold">April 26, 2027</dt><dd className="inline"> · Governments with populations of 50,000 or more</dd></div>
                <div><dt className="inline font-bold">April 26, 2028</dt><dd className="inline"> · Smaller governments and special district governments</dd></div>
              </dl>
              <a className="mt-4 inline-block font-semibold text-indigo-800 underline" href="https://www.ada.gov/resources/small-entity-compliance-guide/">DOJ Title II compliance guide</a>
            </div>
            <div className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6">
              <h3 className="text-lg font-bold">Title III · Public accommodations</h3>
              <p className="mt-2 text-slate-700">Businesses that are places of public accommodation must provide equal access to their goods and services. Barriers in booking, checkout and contact forms can prevent people with disabilities from using those services. The 2027 and 2028 deadlines apply to the Title II rule.</p>
              <a className="mt-4 inline-block font-semibold text-indigo-800 underline" href="https://www.ada.gov/resources/web-guidance/">DOJ web accessibility guidance</a>
            </div>
          </div>
        </section>
        <section aria-labelledby="featured-industries">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="featured-industries" className="text-2xl font-bold tracking-tight">Featured industry and platform guides</h2>
            <Link href="/industries" className="font-semibold text-indigo-800 underline">Browse all guides</Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredIndustries.map((industry) => (
              <li key={industry.slug} className="rounded-xl border border-slate-300 bg-white p-5">
                <Link href={complianceHref(industry.slug)} className="font-bold text-indigo-800 underline">{industry.name}</Link>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{industry.riskContext}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="grid gap-4 rounded-2xl border border-emerald-700 bg-emerald-50 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6" aria-labelledby="statement-heading">
          <div>
            <h2 id="statement-heading" className="text-xl font-bold text-emerald-950">Publish an accessibility statement</h2>
            <p className="mt-1 text-slate-800">Give visitors a clear way to report barriers and request assistance.</p>
          </div>
          <Link href="/statement-generator" className="inline-block rounded-lg bg-emerald-800 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-950">Generate a statement</Link>
        </section>
      </div>
    </>
  );
}
