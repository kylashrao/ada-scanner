import assert from "node:assert/strict";
import dns from "node:dns/promises";
import { EventEmitter } from "node:events";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";
import { Readable } from "node:stream";
import { test } from "node:test";
import { POST } from "../src/app/api/scan/route.ts";
import { MAX_HTML_BYTES } from "../src/lib/urlGuard.ts";

const endpoint = "https://scanner.example/api/scan";
const goodHtml = '<html lang="en"><main><h1>Example</h1></main></html>';

function post(payload) {
  return POST(new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

test("accepts JSON HTML and returns the audit without caching it", async () => {
  const response = await post({ html: goodHtml });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).score, 100);
});

test("keeps the previous text/plain HTML scan entry point working", async () => {
  const response = await POST(new Request(endpoint + "?mode=html", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: goodHtml,
  }));
  assert.equal(response.status, 200);
});

test("returns 400 with JSON for malformed or ambiguous input", async () => {
  const responses = await Promise.all([
    post({}), post({ html: " " }), post({ url: 5 }),
    post({ url: "https://example.com", html: goodHtml }),
    post({ url: "invalid url" }),
    POST(new Request(endpoint, { method: "POST", body: "{" })),
  ]);
  for (const response of responses) {
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, "string");
  }
});

test("returns 422 on guarded targets and oversized HTML", async () => {
  const blocked = await post({ url: "http://127.0.0.1" });
  assert.equal(blocked.status, 422);
  assert.match((await blocked.json()).error, /public network/);

  const tooLarge = await post({ html: "a".repeat(MAX_HTML_BYTES + 1) });
  assert.equal(tooLarge.status, 422);
  assert.match((await tooLarge.json()).error, /2 MB/);
});

test("returns 502 for a public hostname that cannot be resolved", async (context) => {
  const lookup = context.mock.method(dns, "lookup", async () => {
    throw new Error("Host could not be resolved");
  });
  syncBuiltinESMExports();
  try {
    const response = await post({ url: "https://unreachable.example" });
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /could not be reached/);
    assert.equal(lookup.mock.callCount(), 1);
  } finally {
    lookup.mock.restore();
    syncBuiltinESMExports();
  }
});

test("audits a fetched page and rechecks redirect destinations", async (context) => {
  const lookup = context.mock.method(dns, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
  const request = context.mock.method(https, "request", (url, options, callback) => {
    const connection = new EventEmitter();
    connection.end = () => {
      options.lookup(url.hostname, {}, (error, address, family) => {
        assert.ifError(error);
        assert.equal(address, "8.8.8.8");
        assert.equal(family, 4);
      });
      assert.match(options.headers["User-Agent"], /ADA-Scanner/);
      const response = Readable.from([Buffer.from(goodHtml)]);
      response.statusCode = url.pathname === "/redirect" ? 302 : 200;
      response.headers = url.pathname === "/redirect"
        ? { location: "http://127.0.0.1" }
        : { "content-type": "text/html; charset=utf-8" };
      callback(response);
    };
    return connection;
  });
  syncBuiltinESMExports();
  try {
    const scanned = await post({ url: "https://public.example/path" });
    assert.equal(scanned.status, 200);
    assert.equal((await scanned.json()).score, 100);

    const blocked = await post({ url: "https://public.example/redirect" });
    assert.equal(blocked.status, 422);
    assert.match((await blocked.json()).error, /public network/);
    assert.equal(request.mock.callCount(), 2);
  } finally {
    request.mock.restore();
    lookup.mock.restore();
    syncBuiltinESMExports();
  }
});
