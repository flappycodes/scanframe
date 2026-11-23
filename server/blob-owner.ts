import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "scanframe_blob_owner";
const OWNER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function signature(ownerId: string, token: string) {
  return createHmac("sha256", token).update(ownerId).digest("base64url");
}

export function getBlobOwnerId(request: Request, token: string): string | null {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const value = cookie?.slice(COOKIE_NAME.length + 1);
  const [ownerId, providedSignature] = value?.split(".") ?? [];
  if (!ownerId || !providedSignature || !OWNER_ID_PATTERN.test(ownerId)) return null;

  const expectedSignature = signature(ownerId, token);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  return provided.length === expected.length && timingSafeEqual(provided, expected) ? ownerId : null;
}

export function setBlobOwnerCookie(response: Response, request: Request, ownerId: string, token: string) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${ownerId}.${signature(ownerId, token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secure}`,
  );
}
