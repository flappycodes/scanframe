import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getBlobOwnerId } from "../server/blob-owner.js";
import { BLOB_UPLOADS_ENABLED } from "../config/features.js";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }
  if (!BLOB_UPLOADS_ENABLED) {
    return Response.json({ error: "Image and PDF uploads are temporarily disabled." }, { status: 503 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return Response.json({ error: "Set BLOB_READ_WRITE_TOKEN in the server environment and redeploy." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let type: "image" | "pdf";
        let ownerId: string;
        try {
          const payload = JSON.parse(clientPayload ?? "{}") as { type?: string; ownerId?: string };
          if (payload.type !== "image" && payload.type !== "pdf") throw new Error("Unsupported file type.");
          if (!payload.ownerId) throw new Error("Upload session is missing.");
          type = payload.type;
          ownerId = payload.ownerId;
        } catch {
          throw new Error("Choose an image or PDF file.");
        }

        if (getBlobOwnerId(request, token) !== ownerId) {
          throw new Error("Upload session expired. Reload the page and try again.");
        }
        if (!pathname.startsWith(`scanframe/${ownerId}/${type}/`)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: type === "image" ? IMAGE_TYPES : ["application/pdf"],
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload authorization failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
