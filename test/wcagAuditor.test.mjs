import { test } from "node:test";
import assert from "node:assert/strict";
import { auditHtml } from "../src/lib/wcagAuditor.ts";

test("reports all requested static checks with actionable fixes", () => {
  const html = `<html><head><meta name="viewport" content="maximum-scale=1.5"></head><body>
    <h2>Start</h2><h4>Skip</h4><img src="missing"><img src="empty" alt="">
    <input placeholder="Email"><a href="/next"></a><button></button>
    <iframe src="/embedded"></iframe><table><tr><td>Cost</td></tr></table>
    <p style="color:#aaa;background-color:#fff">Low contrast</p></body></html>`;
  const result = auditHtml(html);
  assert.deepEqual(result, auditHtml(html));
  const findings = new Map(result.findings.map((finding) => [finding.id, finding]));
  for (const id of ["page-language", "heading-order", "page-heading", "main-landmark", "image-alt",
    "empty-alt-review", "form-label", "link-button-name", "viewport-zoom", "frame-title", "table-headers", "inline-contrast"]) {
    const finding = findings.get(id);
    assert.ok(finding?.remediation.length && finding.example, id);
  }
  assert.equal(findings.get("heading-order").count, 2);
  assert.equal(findings.get("empty-alt-review").manualReview, true);
  assert.equal(result.severityCounts.critical, 3);
  assert.ok(result.score >= 0 && result.score < 100);
  assert.match(result.disclaimer, /30–40%/);
});

test("accepts named elements, usable zoom and appropriately structured content", () => {
  const html = `<html lang="en"><head><meta name="viewport" content="maximum-scale=2"></head>
    <body><main><h1>Services</h1><h2>Contact</h2>
    <label for="email">Email</label><input id="email">
    <label>Phone <input></label><span id="choice">Choice</span><select aria-labelledby="choice"></select>
    <img src="decor" alt="" role="presentation"><img src="cat" alt="Cat">
    <a href="/menu"><img alt="Menu" src="menu"></a><button aria-label="Close"></button>
    <iframe title="Booking"></iframe><table><tr><th scope="col">Service</th><td>Repair</td></tr></table>
    <table role="presentation"><tr><td>Layout</td></tr></table><p style="color:#111;background:#fff">Readable</p>
    </main></body></html>`;
  const result = auditHtml(html);
  assert.equal(result.score, 100);
  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.severityCounts, { critical: 0, serious: 0, moderate: 0, minor: 0 });
});

test("flags named legacy frames only when the title is missing and detects disabled zoom", () => {
  const result = auditHtml('<head><meta name="viewport" content="user-scalable=no"></head><frameset><frame><frame title="Content"></frameset>');
  assert.equal(result.findings.find(({ id }) => id === "frame-title")?.count, 1);
  assert.equal(result.findings.find(({ id }) => id === "viewport-zoom")?.count, 1);
});
