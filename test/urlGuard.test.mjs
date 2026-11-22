import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchHtml, normalizeUrl, ScanInputError } from "../src/lib/urlGuard.ts";

test("normalizes a public URL and strips the fragment", () => {
  assert.equal(normalizeUrl(" EXAMPLE.com:8443/path?q=1#anchor ").href, "https://example.com:8443/path?q=1");
  assert.equal(normalizeUrl("http://8.8.8.8/").href, "http://8.8.8.8/");
  assert.equal(normalizeUrl("https://[2606:4700:4700::1111]/").protocol, "https:");
});

test("rejects invalid URLs, non-web schemes and credentials", () => {
  for (const input of ["", "invalid url", "file:///file", "ftp://example.com", "data:text/html,x",
    "https://user:pass@example.com", "https://example.com\\bad", "https://example.com:65536"]) {
    assert.throws(() => normalizeUrl(input), ScanInputError, input);
  }
});

test("rejects local hostnames and nonpublic IP destinations", () => {
  for (const host of ["localhost", "app.localhost.", "host.local", "127.0.0.2", "10.255.0.1",
    "172.16.0.1", "172.31.255.255", "192.168.0.1", "169.254.1.1", "0.0.0.0", "100.64.0.1",
    "224.0.0.1", "[::]", "[::1]", "[fc00::1]", "[fd00::1]", "[fe80::1]", "[ff02::1]"]) {
    assert.throws(() => normalizeUrl(`http://${host}/`), ScanInputError, host);
  }
  assert.doesNotThrow(() => normalizeUrl("http://172.32.0.1"));
});

test("fetch validates the input before opening a connection", async () => {
  await assert.rejects(fetchHtml("http://127.0.0.1/"), ScanInputError);
});
