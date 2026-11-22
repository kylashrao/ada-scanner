"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { allowsAdvertising, consentEvent } from "./AdPreferences";

type Props = { publisher: string; slot?: string };

export default function AdSlot({ publisher, slot }: Props) {
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const requested = useRef(false);

  useEffect(() => {
    const initiallyAllowed = allowsAdvertising();
    setConsent(initiallyAllowed);
    const update = () => {
      const allowed = allowsAdvertising();
      if (!allowed && requested.current) window.location.reload();
      else setConsent(allowed);
    };
    window.addEventListener(consentEvent, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(consentEvent, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    if (!slot || !consent || !ready || requested.current) return;
    const adWindow = window as Window & { adsbygoogle?: Array<Record<string, never>> };
    requested.current = true;
    try { (adWindow.adsbygoogle ??= []).push({}); } catch {}
  }, [slot, consent, ready]);

  if (!slot || !/^\d+$/.test(slot)) return null;

  return (
    <aside aria-label="Advertisement" className="my-8 hidden min-h-[290px] flex-col items-center border-y border-slate-300 bg-slate-50 py-2 min-[320px]:flex print:hidden">
      <p className="mb-2 text-sm font-semibold text-slate-800">Advertisement</p>
      <div className="h-[250px] w-[250px] max-w-full">
        {consent && <>
          <Script
            id="adsense-publisher"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
            onReady={() => setReady(true)}
          />
          <ins className="adsbygoogle block" style={{ width: 250, height: 250 }} data-ad-client={publisher} data-ad-slot={slot} />
        </>}
      </div>
    </aside>
  );
}
