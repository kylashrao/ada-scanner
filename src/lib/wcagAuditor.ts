import { load } from "cheerio";
import type { Element } from "domhandler";
import rules from "../../data/wcag_rules.json" with { type: "json" };
import { scanDisclaimer } from "./disclaimer.ts";

type Severity = "critical" | "serious" | "moderate" | "minor";
type Rule = (typeof rules)[number];
type Finding = Pick<Rule, "id" | "title" | "criterion" | "level" | "severity" | "rationale" | "remediation" | "example"> & {
  count: number;
  locations: string[];
};

const weights = { critical: 12, serious: 7, moderate: 4, minor: 2 };
const byId = new Map(rules.map((rule) => [rule.id, rule]));
const visibleContent = 'script, style, template, [hidden], [aria-hidden="true"]';

function declarations(style: string) {
  const values = new Map<string, string>();
  for (const declaration of style.split(";")) {
    const [property, ...parts] = declaration.split(":");
    if (parts.length) {
      const key = property.trim().toLowerCase();
      const value = parts.join(":").trim().toLowerCase();
      if (!values.get(key)?.endsWith("!important") || value.endsWith("!important")) values.set(key, value);
    }
  }
  return (key: string) => values.get(key)?.replace(/\s*!important$/, "").trim();
}

function luminance(color?: string) {
  if (!color) return;
  const named: Record<string, string> = { black: "#000", white: "#fff", gray: "#808080", grey: "#808080" };
  const value = named[color] ?? color;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value)?.[1];
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(value);
  const channels = hex
    ? (hex.length === 3 ? [...hex].map((digit) => digit.repeat(2)) : hex.match(/../g)!).map((part) => parseInt(part, 16))
    : rgb?.slice(1).map(Number);
  if (!channels || channels.some((channel) => channel > 255)) return;
  const [red, green, blue] = channels.map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function auditHtml(html: string) {
  const $ = load(html);
  const findings = new Map<string, Finding>();
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };

  function report(id: string, element?: Element) {
    const rule = byId.get(id)!;
    let finding = findings.get(id);
    if (!finding) {
      const { title, criterion, level, severity, rationale, remediation, example } = rule;
      finding = { id, title, criterion, level, severity, rationale, remediation, example, count: 0, locations: [] };
      findings.set(id, finding);
    }
    finding.count++;
    counts[rule.severity as Severity]++;
    if (element && finding.locations.length < 5) {
      finding.locations.push(element.name + (element.attribs.id ? "#" + element.attribs.id.slice(0, 80) : ""));
    }
  }

  const ids = new Map<string, Element>();
  $("[id]").each((_, element) => {
    if (!ids.has(element.attribs.id)) ids.set(element.attribs.id, element);
  });
  function content(element: Element) {
    const copy = $(element).clone();
    copy.find(visibleContent).remove();
    copy.find("img[alt]").each((_, image) => { $(image).replaceWith($("<span>").text(image.attribs.alt)); });
    return copy.text().trim();
  }
  function explicitName(element: Element) {
    const refs = (element.attribs["aria-labelledby"] ?? "").trim().split(/\s+/);
    return refs.some((id) => {
      const label = ids.get(id);
      return label && Boolean(label.attribs["aria-label"]?.trim() || content(label));
    }) || Boolean(element.attribs["aria-label"]?.trim());
  }

  const labels = new Set<string>();
  $("label[for]").each((_, label) => {
    if (content(label)) labels.add(label.attribs.for);
  });
  const visible = (element: Element) => !$(element).closest(visibleContent).length;
  if (!$("html").attr("lang")?.trim()) report("page-language", $("html").get(0));
  let previousHeading = 0;
  let hasH1 = false;
  $("h1,h2,h3,h4,h5,h6").each((_, element) => {
    if (!visible(element)) return;
    const level = Number(element.name[1]);
    hasH1 ||= level === 1;
    if (level > previousHeading + 1) report("heading-order", element);
    previousHeading = level;
  });
  if (!hasH1) report("page-heading");
  if (!$('main, [role="main"]').toArray().some(visible)) report("main-landmark");

  $("img, input[type=image], input, select, textarea, a[href], button, iframe, frame, meta[name], table, [style]").each((_, element) => {
    const attrs = element.attribs;
    const tag = element.name;
    const type = attrs.type?.toLowerCase() ?? "";
    if (tag === "meta" && attrs.name?.toLowerCase() === "viewport") {
      const viewport = attrs.content ?? "";
      if (/(?:^|[,;\s])user-scalable\s*=\s*(?:no|0)(?=$|[,;\s])/i.test(viewport) ||
          Array.from(viewport.matchAll(/(?:^|[,;\s])maximum-scale\s*=\s*(\d*\.?\d+)(?=$|[,;\s])/gi)).some((match) => Number(match[1]) < 2)) {
        report("viewport-zoom", element);
      }
    }
    if (!visible(element)) return;
    if (tag === "img" || (tag === "input" && type === "image")) {
      const decorative = tag === "img" && /^(presentation|none)$/.test(attrs.role ?? "");
      if (!decorative && attrs.alt === undefined) report("image-alt", element);
      if (!decorative && attrs.alt !== undefined && !attrs.alt.trim() && !explicitName(element)) report("empty-alt-review", element);
    }
    if (tag === "input" && type === "button") {
      if (!explicitName(element) && !attrs.value?.trim() && !attrs.title?.trim()) report("link-button-name", element);
    } else if (["input", "select", "textarea"].includes(tag) && !["hidden", "submit", "reset", "image"].includes(type)) {
      const wrapping = $(element).closest("label").get(0) as Element | undefined;
      const wrapsControl = wrapping && (!("for" in wrapping.attribs) || (attrs.id && wrapping.attribs.for === attrs.id));
      if (!explicitName(element) && !attrs.title?.trim() && !(attrs.id && labels.has(attrs.id)) && !(wrapsControl && content(wrapping))) {
        report("form-label", element);
      }
    }
    if ((tag === "a" || tag === "button") && !explicitName(element) && !content(element) && !attrs.title?.trim()) {
      report("link-button-name", element);
    }
    if ((tag === "iframe" || tag === "frame") && !attrs.title?.trim()) report("frame-title", element);
    if (tag === "table" && !/^(presentation|none)$/.test(attrs.role ?? "")) {
      const cells = $(element).find<Element>('td, th, [role="columnheader"], [role="rowheader"]')
        .toArray().filter((cell) => $(cell).closest("table").get(0) === element);
      if (cells.length && cells.every((cell) => cell.name === "td" && !/^(columnheader|rowheader)$/.test(cell.attribs.role ?? ""))) {
        report("table-headers", element);
      }
    }

    if (attrs.style && $(element).contents().toArray().some((node) => node.type === "text" && node.data.trim())) {
      const css = declarations(attrs.style);
      const foreground = luminance(css("color"));
      const background = luminance(css("background-color") ?? css("background"));
      if (foreground !== undefined && background !== undefined) {
        const ratio = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
        const size = /^(\d+(?:\.\d+)?)(px|pt)$/.exec(css("font-size") ?? "");
        const pixels = size ? Number(size[1]) * (size[2] === "pt" ? 4 / 3 : 1) : undefined;
        const weight = css("font-weight") ?? "";
        const bold = weight === "bold" || Number(weight) >= 700;
        if (ratio < 3 || (pixels !== undefined && pixels < (bold ? 18.67 : 24) && ratio < 4.5)) {
          report("inline-contrast", element);
        }
      }
    }
  });

  const penalty = [...findings.values()].reduce((total, finding) => {
    const rule = byId.get(finding.id)!;
    return total + (rule.review ? 0 : weights[finding.severity as Severity] * Math.min(5, finding.count));
  }, 0);
  return { score: Math.max(0, 100 - penalty), severityCounts: counts,
    findings: [...findings.values()].map((finding) => ({ ...finding, manualReview: byId.get(finding.id)!.review })),
    disclaimer: scanDisclaimer };
}
