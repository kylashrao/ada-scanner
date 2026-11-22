import type { Metadata } from "next";
import { scanDisclaimer } from "../lib/disclaimer";
import { guideLinks } from "../lib/guides";
import { publisher, siteOrigin } from "../lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: "ADA Scanner", template: "%s | ADA Scanner" },
  description: "Run a WCAG 2.1 A and AA HTML accessibility scan and find practical remediation guidance.",
  other: { "google-adsense-account": publisher },
};

const trustLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/legal-disclaimer", label: "Legal disclaimer" },
];

const editorialLinks = [{ href: "/guides", label: "All accessibility guides" }, ...guideLinks];

function HeaderMenu({ title, links }: { title: string; links: typeof trustLinks }) {
  return (
    <details className="sm:relative">
      <summary className="min-h-11 cursor-pointer py-2.5 hover:text-white">{title}</summary>
      <ul className="absolute left-5 z-20 mt-2 w-44 space-y-1 rounded-lg border border-slate-600 bg-slate-950 p-2 min-[360px]:w-52 sm:right-0 sm:left-auto">
        {links.map(({ href, label }) => <li key={href}><a href={href} className="flex min-h-11 items-center rounded px-2 py-2 hover:bg-slate-800">{label}</a></li>)}
      </ul>
    </details>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body className="bg-slate-100 text-slate-950">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-30 focus:rounded-lg focus:bg-white focus:p-3">Skip to main content</a>
        <header className="bg-slate-950 text-white">
          <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
            <a href="/" className="inline-flex items-center gap-3 font-bold">
              <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-emerald-300 text-slate-950">✓</span> ADA Scanner
            </a>
            <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-5 text-sm font-semibold text-slate-200 [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center">
              <a href="/">Scanner</a>
              <a href="/industries">Industry guides</a>
              <a href="/rules">WCAG rules</a>
              <a href="/statement-generator">Statement generator</a>
              <HeaderMenu title="Guides" links={editorialLinks} />
              <HeaderMenu title="About & legal" links={trustLinks} />
            </nav>
          </div>
        </header>
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="border-t border-slate-300 bg-white">
          <div className="mx-auto max-w-6xl space-y-5 px-5 py-8 text-sm leading-relaxed text-slate-700 sm:px-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <nav aria-label="Trust and legal" className="space-y-2">
                <h2 className="font-bold text-slate-950">Trust and legal</h2>
                <ul className="space-y-1 font-semibold text-indigo-800 underline">
                  {trustLinks.map(({ href, label }) => <li key={href}><a href={href}>{label}</a></li>)}
                  <li><a href="/privacy-policy#advertising-choices">Privacy choices / Do not sell or share</a></li>
                </ul>
              </nav>
              <nav aria-label="Featured accessibility guides" className="space-y-2">
                <h2 className="font-bold text-slate-950">Accessibility guides</h2>
                <ul className="space-y-1 font-semibold text-indigo-800 underline">
                  {editorialLinks.map(({ href, label }) => <li key={href}><a href={href}>{label}</a></li>)}
                </ul>
              </nav>
            </div>
            <p>{scanDisclaimer}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
