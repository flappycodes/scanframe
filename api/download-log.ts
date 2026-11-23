const ALLOWED_DOWNLOADS: Record<string, string> = {
  png: "scanframe.png",
  svg: "scanframe.svg",
  pdf: "qr-frame.pdf",
};

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  try {
    const body = (await request.json()) as { format?: string; filename?: string };
    if (!body.format || ALLOWED_DOWNLOADS[body.format] !== body.filename) {
      return Response.json({ error: "Unsupported download format." }, { status: 400 });
    }

    console.info("qr-download", JSON.stringify({ format: body.format, filename: body.filename }));
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Invalid download log request." }, { status: 400 });
  }
}

export default { fetch: handler };
