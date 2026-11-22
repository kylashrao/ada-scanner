import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import industries from "../../../../data/industries.json";
import ScannerWidget from "../../../components/ScannerWidget";
import { complianceHref, relatedIndustries } from "../../../lib/industries";
import { scanDisclaimer } from "../../../lib/disclaimer";
import { siteUrl } from "../../../lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map(({ slug }) => ({ slug }));
}

async function getIndustry(params: Props["params"]) {
  const { slug } = await params;
  const industry = industries.find((entry) => entry.slug === slug);
  if (!industry) notFound();
  return industry;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const industry = await getIndustry(params);
  return {
    title: `${industry.name} ADA website accessibility`,
    description: industry.riskContext,
    alternates: { canonical: siteUrl(complianceHref(industry.slug)) },
  };
}

export default async function ComplianceGuide({ params }: Props) {
  const industry = await getIndustry(params);
  const url = siteUrl(complianceHref(industry.slug));
  const related = relatedIndustries(industry.slug);
  const faq = [
    {
      question: `Which accessibility barriers should teams review for ${industry.name}?`,
      answer: `${industry.riskContext} Start with these common barriers. ${industry.commonFailures.join(". ")}.`,
    },
    {
      question: `How can teams verify accessibility improvements for ${industry.name}?`,
      answer: industry.verificationScenario,
    },
    {
      question: "What does the automated scan cover?",
      answer: scanDisclaimer,
    },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${industry.name} ADA website accessibility`,
        description: industry.riskContext,
        inLanguage: "en-US",
        mainEntity: { "@id": `${url}#faq` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faq.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <div className="dark-surface bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-22 sm:px-8">
          <Link href="/industries" className="text-sm font-semibold text-emerald-300 underline">All industry guides</Link>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">Website accessibility for {industry.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200">{industry.riskContext}</p>
        </div>
      </div>
      <div className="relative mx-auto -mt-12 max-w-6xl space-y-8 px-5 pb-16 sm:px-8">
        <ScannerWidget context={{
          name: industry.name,
          guideHref: `${complianceHref(industry.slug)}#remediation`,
          example: `Start with a public page in the workflow below. Review it for issues such as ${industry.commonFailures.map((failure) => failure[0].toLowerCase() + failure.slice(1)).join(" and ")}.`,
        }} />
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6" aria-labelledby="risk-heading">
            <h2 id="risk-heading" className="text-xl font-bold">Accessibility risk and common pitfalls</h2>
            <p className="mt-3">{industry.riskContext}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">{industry.commonFailures.map((item) => <li key={item}>{item}</li>)}</ul>
            <Link href="/rules#ada" className="mt-4 inline-block font-semibold text-indigo-800 underline">Review which ADA requirements apply</Link>
          </section>
          <section id="remediation" className="scroll-mt-6 rounded-xl border border-slate-300 bg-white p-5 sm:p-6">
            <h2 className="text-xl font-bold">Remediation checklist</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">{industry.remediationChecklist.map((item) => <li key={item}>{item}</li>)}</ol>
            <Link href="/statement-generator" className="mt-4 inline-block font-semibold text-indigo-800 underline">Draft an accessibility statement</Link>
          </section>
        </div>
        <section className="rounded-xl border border-emerald-700 bg-emerald-50 p-5 sm:p-6">
          <h2 className="text-xl font-bold">Manual verification scenario</h2>
          <p className="mt-2">{industry.verificationScenario}</p>
        </section>
        <section id="faq" className="space-y-3">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          {faq.map(({ question, answer }) => (
            <details key={question} className="rounded-xl border border-slate-300 bg-white p-4">
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-3 text-slate-700">{answer}</p>
            </details>
          ))}
        </section>
        <section>
          <h2 className="text-2xl font-bold">Related industry guides</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((entry) => <li key={entry.slug}><Link href={complianceHref(entry.slug)} className="block rounded-xl border border-slate-300 bg-white p-4 font-semibold text-indigo-800 underline hover:border-indigo-600">{entry.name}</Link></li>)}
          </ul>
        </section>
      </div>
    </article>
  );
}
