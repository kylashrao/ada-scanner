"use client";

import { useEffect, useState } from "react";

const preferenceKey = "ada-scanner-advertising";
export const consentEvent = "ada-scanner-privacy-change";

export function hasGlobalPrivacyControl() {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function allowsAdvertising() {
  try {
    if (hasGlobalPrivacyControl()) {
      localStorage.setItem(preferenceKey, "deny");
      return false;
    }
    return localStorage.getItem(preferenceKey) === "allow";
  } catch { return false; }
}

export default function AdPreferences({ enabled }: { enabled: boolean }) {
  const [choice, setChoice] = useState<string>();
  const [gpc, setGpc] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setGpc(hasGlobalPrivacyControl());
    allowsAdvertising();
    try { setChoice(localStorage.getItem(preferenceKey) ?? undefined); } catch {}
  }, []);

  function update(value: "allow" | "deny") {
    try {
      const previouslyAllowed = allowsAdvertising();
      localStorage.setItem(preferenceKey, value);
      setChoice(value);
      if (previouslyAllowed && value === "deny") window.location.reload();
      else window.dispatchEvent(new Event(consentEvent));
    } catch {
      setNotice("Browser storage is unavailable. Optional advertising stays off.");
    }
  }

  return (
    <div id="advertising-choices" className="space-y-3 rounded-xl border border-slate-400 bg-slate-50 p-4">
      <h3 className="text-lg font-bold">Advertising choices</h3>
      <p role="status">{gpc ? "Global Privacy Control is on. Optional advertising is blocked." : choice === "deny"
        ? "Your opt-out is saved for this browser." : !enabled ? "Optional ads are currently inactive on this site."
          : choice === "allow" ? "You allowed optional advertising on this browser." : "Optional advertising is off until you allow it."} {notice}</p>
      <div className="flex flex-wrap gap-3">
        {enabled && !gpc && <button type="button" className="rounded-lg border border-indigo-800 px-4 py-2 font-semibold text-indigo-900" onClick={() => update("allow")}>Allow optional ads</button>}
        <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white" onClick={() => update("deny")}>Do not sell or share my personal information</button>
      </div>
    </div>
  );
}
