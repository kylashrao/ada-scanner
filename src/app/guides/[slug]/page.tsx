import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "../../../components/AdSlot";
import { adConfig } from "../../../lib/advertising";
import { guides } from "../../../lib/guides";
import { operator, siteUrl } from "../../../lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

async function getGuide(params: Props["params"]) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return guide;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, title, description } = await getGuide(params);
  const url = siteUrl(`/guides/${slug}`);
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, locale: "en_US" },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = await getGuide(params);
  const url = siteUrl(`/guides/${guide.slug}`);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: guide.title,
    description: guide.description,
    inLanguage: "en-US",
    author: { "@type": "Organization", name: operator, url: siteUrl("/about") },
    publisher: { "@type": "Organization", name: operator, url: siteUrl("/") },
    citation: guide.sources.map(({ url }) => url),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
      <a href="/guides" className="font-semibold text-indigo-800 underline">All accessibility guides</a>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{guide.title}</h1>
      <p className="mt-3 text-sm font-semibold text-slate-700">By <a href="/about" className="text-indigo-800 underline">{operator}</a></p>
      <p className="mt-5 text-lg leading-relaxed text-slate-800">{guide.intro}</p>
      {guide.sections.map(({ heading, paragraphs }, index) => (
        <section key={heading} className="mt-8 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
          {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {index === 1 && <AdSlot {...adConfig} />}
        </section>
      ))}
      <section aria-labelledby="guide-sources" className="mt-9 rounded-xl border border-slate-300 bg-white p-5">
        <h2 id="guide-sources" className="text-xl font-bold">Sources</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {guide.sources.map((source) => <li key={source.url}><a href={source.url} className="font-semibold text-indigo-800 underline">{source.label}</a></li>)}
        </ul>
      </section>
      <nav aria-label="Accessibility tools" className="mt-7 flex flex-wrap gap-4 font-semibold text-indigo-800 underline">
        <a href="/">Scan a website</a>
        <a href="/statement-generator">Draft an accessibility statement</a>
      </nav>
    </article>
  );
}
