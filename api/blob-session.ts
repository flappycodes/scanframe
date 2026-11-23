import { randomUUID } from "node:crypto";
import { getBlobOwnerId, setBlobOwnerCookie } from "../server/blob-owner.js";

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return Response.json({ error: "Set BLOB_READ_WRITE_TOKEN in the server environment and restart the app." }, { status: 503 });
  }

  const existingOwnerId = getBlobOwnerId(request, token);
  const ownerId = existingOwnerId ?? randomUUID();
  const response = Response.json({ ownerId });
  if (!existingOwnerId) setBlobOwnerCookie(response, request, ownerId, token);
  return response;
}
