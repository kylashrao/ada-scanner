import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";

export const MAX_HTML_BYTES = 2 * 1024 * 1024;
export class ScanInputError extends Error {}
export class InvalidScanUrlError extends ScanInputError {}

function assertPublicAddress(address: string) {
  if (!isIP(address)) throw new ScanInputError("Invalid network address.");
  const ip = ipaddr.process(address);
  if (ip.range() !== "unicast" || (ip.kind() === "ipv6" && !ip.match(ipaddr.IPv6.parse("2000::"), 3))) {
    throw new ScanInputError("Only public network addresses can be scanned.");
  }
}

export function normalizeUrl(input: string): URL {
  const value = input.trim();
  if (!value || value.length > 2048 || /[\s\\\u0000-\u001f\u007f]/u.test(value)) {
    throw new InvalidScanUrlError("Enter a valid HTTP or HTTPS URL.");
  }
  let url: URL;
  try {
    const explicitScheme = /^[a-z][a-z\d+.-]*:/i.test(value) && !/^[^/:]+:\d+(?:[/?#]|$)/.test(value);
    url = new URL(explicitScheme ? value : `https://${value}`);
  } catch {
    throw new InvalidScanUrlError("Enter a valid HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new ScanInputError("Use HTTP or HTTPS without embedded credentials.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").replace(/\.+$/, "");
  if (isIP(host)) {
    assertPublicAddress(host);
  } else if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(host) || /(?:^|\.)(?:localhost|local)$/.test(host)) {
    throw new ScanInputError("Enter a public hostname.");
  }
  url.hash = "";
  return url;
}

async function resolveDestination(url: URL, signal: AbortSignal) {
  const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.+$/, "");
  const family = isIP(hostname);
  if (family) return { address: hostname, family };
  return new Promise<{ address: string; family: number }>((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.throwIfAborted();
    signal.addEventListener("abort", abort, { once: true });
    lookup(hostname, { all: true, verbatim: true }).then((records) => {
      if (!records.length) throw new Error("The hostname did not resolve.");
      for (const record of records) assertPublicAddress(record.address);
      resolve(records[0]);
    }).catch(reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

export async function fetchHtml(input: string): Promise<string> {
  const signal = AbortSignal.timeout(8000);
  let url = normalizeUrl(input);
  for (let redirects = 0; redirects <= 5; redirects++) {
    const destination = await resolveDestination(url, signal);
    const request = url.protocol === "https:" ? httpsRequest : httpRequest;
    const response = await new Promise<import("node:http").IncomingMessage>((resolve, reject) => {
      const req = request(url, {
        agent: false,
        signal,
        family: destination.family,
        lookup: (_hostname, _options, callback) => callback(null, destination.address, destination.family),
        headers: { "User-Agent": "ADA-Scanner/1.0", Accept: "text/html, application/xhtml+xml" },
      }, resolve);
      req.on("error", reject);
      req.end();
    });
    const status = response.statusCode ?? 0;
    if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
      response.destroy();
      url = normalizeUrl(new URL(response.headers.location, url).href);
      continue;
    }
    if (status < 200 || status >= 300) {
      response.destroy();
      throw new Error("The website returned an unsuccessful response.");
    }
    if (!/^(text\/html|application\/xhtml\+xml)(?:\s*;|$)/i.test(response.headers["content-type"] ?? "")) {
      response.destroy();
      throw new ScanInputError("The website did not return an accessible HTML response.");
    }
    if (response.headers["content-encoding"] && response.headers["content-encoding"] !== "identity") {
      response.destroy();
      throw new ScanInputError("The website returned an unsupported content encoding.");
    }
    if (Number(response.headers["content-length"]) > MAX_HTML_BYTES) {
      response.destroy();
      throw new ScanInputError("The page exceeds the 2 MB scan limit.");
    }
    const chunks: Buffer[] = [];
    let bytes = 0;
    for await (const chunk of response) {
      bytes += chunk.length;
      if (bytes > MAX_HTML_BYTES) throw new ScanInputError("The page exceeds the 2 MB scan limit.");
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  throw new Error("The website exceeded the redirect limit.");
}
