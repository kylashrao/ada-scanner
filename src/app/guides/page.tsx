import { guides } from "../../lib/guides";
import { siteUrl } from "../../lib/site";

const title = "Website accessibility guides";
const description = "Research-backed guides to US ADA requirements, WCAG 2.1, accessible design and e-commerce remediation.";
export const metadata = { title, description, alternates: { canonical: siteUrl("/guides") } };

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-700">Read how to plan an accessibility audit, understand US ADA requirements and fix barriers in real workflows.</p>
      <ul className="mt-7 grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug} className="rounded-xl border border-slate-300 bg-white p-5">
            <h2 className="text-lg font-bold"><a href={`/guides/${guide.slug}`} className="text-indigo-800 underline">{guide.title}</a></h2>
            <p className="mt-2 text-slate-700">{guide.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
