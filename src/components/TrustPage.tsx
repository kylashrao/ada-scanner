import type { ReactNode } from "react";

export default function TrustPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-700">{intro}</p>
      <div className="mt-7 space-y-7 rounded-2xl border border-slate-300 bg-white p-5 leading-relaxed wrap-anywhere sm:p-8 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_p+p]:mt-3 [&_a]:font-semibold [&_a]:text-indigo-800 [&_a]:underline">{children}</div>
    </article>
  );
}
