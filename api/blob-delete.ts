import { del } from "@vercel/blob";
import { getBlobOwnerId } from "../server/blob-owner.js";

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return Response.json({ error: "Set BLOB_READ_WRITE_TOKEN in the server environment and redeploy." }, { status: 503 });
  }

  const ownerId = getBlobOwnerId(request, token);
  if (!ownerId) return Response.json({ error: "This browser session cannot remove this upload." }, { status: 403 });

  try {
    const body = (await request.json()) as { url?: string };
    if (!body.url) return Response.json({ error: "A file URL is required." }, { status: 400 });

    const pathname = new URL(body.url).pathname;
    const ownedPath = new RegExp(`^/scanframe/${ownerId}/(?:image|pdf)/[a-zA-Z0-9._%~-]+$`);
    if (!ownedPath.test(pathname)) {
      return Response.json({ error: "Only this browser session's ScanFrame uploads can be removed." }, { status: 403 });
    }

    await del(pathname.slice(1), { token });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The file could not be removed.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export default { fetch: handler };
