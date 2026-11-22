import { auditHtml } from "../../../lib/wcagAuditor.ts";
import { fetchHtml, InvalidScanUrlError, MAX_HTML_BYTES, ScanInputError } from "../../../lib/urlGuard.ts";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };
const maxJsonBytes = MAX_HTML_BYTES * 6 + 4096;

class InvalidRequest extends Error {}
class InputTooLarge extends Error {}

async function readBody(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel().catch(() => {});
        throw new InputTooLarge("The request exceeds the scan input limit.");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally {
    reader.releaseLock();
  }
}

async function readInput(request: Request) {
  const legacyMode = new URL(request.url).searchParams.get("mode");
  const contentType = request.headers.get("content-type")?.split(";")[0].toLowerCase().trim();
  if (contentType === "text/plain" && (legacyMode === "url" || legacyMode === "html")) {
    return { [legacyMode]: await readBody(request, legacyMode === "url" ? 8192 : MAX_HTML_BYTES) };
  }

  const body = await readBody(request, maxJsonBytes);
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new InvalidRequest("Send a JSON object with a url or html field.");
  }
  if (typeof payload !== "object" || !payload || Array.isArray(payload)) {
    throw new InvalidRequest("Send a JSON object with a url or html field.");
  }
  return payload as Record<string, unknown>;
}

function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers: noStore });
}

export async function POST(request: Request) {
  let html: string;
  let url: string | undefined;
  try {
    const input = await readInput(request);
    const hasUrl = Object.hasOwn(input, "url");
    const hasHtml = Object.hasOwn(input, "html");
    if (hasUrl === hasHtml) throw new InvalidRequest("Provide exactly one of url or html.");
    if (hasUrl) {
      if (typeof input.url !== "string" || !input.url.trim()) throw new InvalidRequest("Enter a website URL.");
      url = input.url;
      html = "";
    } else {
      if (typeof input.html !== "string" || !input.html.trim()) throw new InvalidRequest("Paste HTML to scan.");
      html = input.html;
      if (Buffer.byteLength(html) > MAX_HTML_BYTES) throw new InputTooLarge("Pasted HTML exceeds the 2 MB scan limit.");
    }
  } catch (error) {
    if (error instanceof InputTooLarge) return fail(error.message, 422);
    return fail(error instanceof InvalidRequest ? error.message : "The request body could not be read.", 400);
  }

  if (url !== undefined) {
    try {
      html = await fetchHtml(url);
      if (!html.trim()) return fail("The website returned an empty HTML response.", 422);
    } catch (error) {
      if (error instanceof InvalidScanUrlError) return fail(error.message, 400);
      if (error instanceof ScanInputError) return fail(error.message, 422);
      if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) {
        return fail("The website took longer than 8 seconds to respond.", 502);
      }
      return fail("The website could not be reached or returned an unsuccessful response.", 502);
    }
  }

  return Response.json(auditHtml(html), { headers: noStore });
}
