import { forwardRef, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import QRCode from "qrcode";
import { upload } from "@vercel/blob/client";
import { BLOB_UPLOADS_ENABLED } from "../config/features";
import PromoPreview from "./components/PromoPreview";
import "./App.css";

/* ---------- types ---------- */
type CatKey = "essentials" | "shops" | "gifting" | "contacts" | "wifi" | "events" | "food" | "phone" | "email" | "sms" | "location" | "text" | "image" | "pdf";
type FrameKey = "default" | "box" | "pointer" | "hand" | "ticket" | "corners" | "badge" | "arch" | "polaroid" | "ribbon" | "diamond" | "stamp";
type Field = { key: string; label: string; placeholder: string };
type UploadType = "image" | "pdf";
type UploadedFile = { url: string; name: string };
type Cat = {
  name: string;
  label: string;
  fields: Field[];
  build: (v: Record<string, string>) => string;
  fileType?: "image" | "pdf";
};
type FrameDef = {
  name: string;
  w: number;
  h: number;
  q: [number, number, number]; // x, y, size of the QR area
  render: (accent: string, label: string) => ReactNode;
};

/* ---------- categories and payloads ---------- */
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

const CATS: Record<CatKey, Cat> = {
  essentials: { name: "Essentials", label: "SCAN ME", fields: [{ key: "url", label: "Link", placeholder: "https://example.com" }], build: (v) => v.url },
  shops: { name: "Shops", label: "SHOP NOW", fields: [{ key: "url", label: "Shop link", placeholder: "https://example.com/shop" }], build: (v) => v.url },
  gifting: { name: "Gifting", label: "A GIFT FOR YOU", fields: [{ key: "url", label: "Gift link", placeholder: "https://example.com/gift" }], build: (v) => v.url },
  contacts: {
    name: "Contacts",
    label: "SAVE CONTACT",
    fields: [
      { key: "name", label: "Full name", placeholder: "Ana Reyes" },
      { key: "phone", label: "Phone", placeholder: "+63 900 000 0000" },
    ],
    build: (v) => `BEGIN:VCARD\nVERSION:3.0\nFN:${v.name}\nTEL:${v.phone}\nEND:VCARD`,
  },
  wifi: {
    name: "Wi-Fi",
    label: "JOIN WI-FI",
    fields: [
      { key: "ssid", label: "Network name", placeholder: "CafeGuest" },
      { key: "pw", label: "Password", placeholder: "welcome123" },
    ],
    build: (v) => `WIFI:T:WPA;S:${escWifi(v.ssid)};P:${escWifi(v.pw)};;`,
  },
  events: { name: "Events", label: "RSVP HERE", fields: [{ key: "url", label: "Event link", placeholder: "https://example.com/event" }], build: (v) => v.url },
  food: { name: "Food & Drinks", label: "SEE THE MENU", fields: [{ key: "url", label: "Menu link", placeholder: "https://example.com/menu" }], build: (v) => v.url },
  phone: { name: "Phone", label: "CALL NOW", fields: [{ key: "phone", label: "Phone number", placeholder: "+1 555 123 4567" }], build: (v) => `tel:${v.phone.replace(/[\s()-]/g, "")}` },
  email: { name: "Email", label: "EMAIL US", fields: [{ key: "email", label: "Email address", placeholder: "hello@example.com" }], build: (v) => `mailto:${v.email.trim()}` },
  sms: { name: "SMS", label: "TEXT US", fields: [{ key: "phone", label: "Phone number", placeholder: "+1 555 123 4567" }], build: (v) => `sms:${v.phone.replace(/[\s()-]/g, "")}` },
  location: { name: "Location", label: "FIND US", fields: [{ key: "latitude", label: "Latitude", placeholder: "37.7749" }, { key: "longitude", label: "Longitude", placeholder: "-122.4194" }], build: (v) => `geo:${v.latitude.trim()},${v.longitude.trim()}` },
  text: { name: "Plain text", label: "READ MESSAGE", fields: [{ key: "text", label: "Message", placeholder: "Enter a short message" }], build: (v) => v.text },
  image: { name: "Image upload", label: "VIEW IMAGE", fields: [], build: () => "", fileType: "image" },
  pdf: { name: "PDF upload", label: "OPEN PDF", fields: [], build: () => "", fileType: "pdf" },
};

/* ---------- frames ---------- */
const DISPLAY = "'Bricolage Grotesque','Segoe UI',system-ui,sans-serif";

const FRAMES: Record<FrameKey, FrameDef> = {
  default: { name: "Default", w: 300, h: 300, q: [20, 20, 260], render: () => null },
  box: {
    name: "Box",
    w: 300,
    h: 370,
    q: [30, 30, 240],
    render: (a, l) => (
      <>
        <rect x="4" y="4" width="292" height="362" rx="18" fill="#fff" stroke={a} strokeWidth="8" />
        <path d="M4 290H296V348a18 18 0 0 1-18 18H22a18 18 0 0 1-18-18Z" fill={a} />
        <text x="150" y="338" textAnchor="middle" fontFamily={DISPLAY} fontSize="28" fontWeight="800" fill="#fff">{l}</text>
      </>
    ),
  },
  pointer: {
    name: "Pointer tab",
    w: 300,
    h: 380,
    q: [30, 90, 240],
    render: (a, l) => (
      <>
        <rect x="4" y="60" width="292" height="316" rx="16" fill="#fff" stroke={a} strokeWidth="8" />
        <path d="M40 6H260a14 14 0 0 1 14 14V50a14 14 0 0 1-14 14H170L150 82 130 64H40A14 14 0 0 1 26 50V20A14 14 0 0 1 40 6Z" fill={a} />
        <text x="150" y="44" textAnchor="middle" fontFamily={DISPLAY} fontSize="24" fontWeight="800" fill="#fff">{l}</text>
      </>
    ),
  },
  hand: {
    name: "Hand drawn",
    w: 300,
    h: 370,
    q: [30, 30, 240],
    render: (a, l) => (
      <>
        <rect width="300" height="370" fill="#fff" />
        <path d="M10 14Q150 4 290 12Q298 180 288 300Q150 310 12 302Q4 160 10 14Z" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" />
        <path d="M14 10Q152 16 286 8Q292 170 292 304Q148 296 8 306Q10 150 14 10Z" fill="none" stroke={a} strokeWidth="2.5" opacity=".7" />
        <text x="150" y="346" textAnchor="middle" fontFamily="'Segoe Print','Comic Sans MS',cursive" fontSize="28" fill={a}>{l}</text>
        <path d="M80 356Q150 362 220 354" stroke={a} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  ticket: {
    name: "Ticket",
    w: 320,
    h: 390,
    q: [40, 38, 240],
    render: (a, l) => (
      <>
        <path d="M22 6H298a16 16 0 0 1 16 16v98a25 25 0 0 0 0 50v98a16 16 0 0 1-16 16H22a16 16 0 0 1-16-16v-98a25 25 0 0 0 0-50V22A16 16 0 0 1 22 6Z" fill="#fff" stroke={a} strokeWidth="6" />
        <path d="M28 302H292" stroke={a} strokeWidth="2" strokeDasharray="5 7" opacity=".45" />
        <text x="160" y="350" textAnchor="middle" fontFamily={DISPLAY} fontSize="25" fontWeight="800" fill={a}>{l}</text>
      </>
    ),
  },
  corners: {
    name: "Corner marks",
    w: 300,
    h: 370,
    q: [30, 30, 240],
    render: (a, l) => (
      <>
        <path d="M48 12H24a12 12 0 0 0-12 12v24M252 12h24a12 12 0 0 1 12 12v24M288 322v24a12 12 0 0 1-12 12h-24M48 358H24a12 12 0 0 1-12-12v-24" fill="none" stroke={a} strokeWidth="7" strokeLinecap="round" />
        <text x="150" y="350" textAnchor="middle" fontFamily={DISPLAY} fontSize="25" fontWeight="800" fill={a}>{l}</text>
      </>
    ),
  },
  badge: {
    name: "Round badge",
    w: 360,
    h: 360,
    q: [65, 65, 230],
    render: (a, l) => (
      <>
        <circle cx="180" cy="180" r="174" fill="#fff" stroke={a} strokeWidth="6" />
        <circle cx="180" cy="180" r="164" fill="none" stroke={a} strokeWidth="1.5" strokeDasharray="3 7" opacity=".5" />
        <text x="180" y="42" textAnchor="middle" fontFamily={DISPLAY} fontSize="20" fontWeight="800" fill={a}>{l}</text>
      </>
    ),
  },
  arch: {
    name: "Arch",
    w: 300,
    h: 380,
    q: [30, 76, 240],
    render: (a, l) => (
      <>
        <path d="M8 372V150a142 142 0 0 1 284 0v222Z" fill="#fff" stroke={a} strokeWidth="7" strokeLinejoin="round" />
        <text x="150" y="55" textAnchor="middle" fontFamily={DISPLAY} fontSize="23" fontWeight="800" fill={a}>{l}</text>
      </>
    ),
  },
  polaroid: {
    name: "Polaroid",
    w: 320,
    h: 390,
    q: [40, 30, 240],
    render: (a, l) => (
      <>
        <rect x="8" y="8" width="304" height="374" rx="8" fill="#fff" stroke={a} strokeWidth="5" />
        <text x="160" y="344" textAnchor="middle" fontFamily={DISPLAY} fontSize="24" fontWeight="800" fill={a}>{l}</text>
        <path d="M92 360H228" stroke={a} strokeWidth="2" strokeLinecap="round" opacity=".45" />
      </>
    ),
  },
  ribbon: {
    name: "Ribbon",
    w: 300,
    h: 390,
    q: [30, 100, 240],
    render: (a, l) => (
      <>
        <rect x="5" y="72" width="290" height="310" rx="18" fill="#fff" stroke={a} strokeWidth="6" />
        <path d="M18 10H282L300 30 282 50v36H18V50L0 30Z" fill={a} />
        <text x="150" y="55" textAnchor="middle" fontFamily={DISPLAY} fontSize="22" fontWeight="800" fill="#fff">{l}</text>
      </>
    ),
  },
  diamond: {
    name: "Diamond",
    w: 400,
    h: 400,
    q: [110, 110, 180],
    render: (a, l) => (
      <>
        <polygon points="200,4 396,200 200,396 4,200" fill="#fff" stroke={a} strokeWidth="7" />
        <text x="200" y="66" textAnchor="middle" fontFamily={DISPLAY} fontSize="22" fontWeight="800" fill={a}>{l}</text>
      </>
    ),
  },
  stamp: {
    name: "Dashed border",
    w: 320,
    h: 370,
    q: [40, 40, 240],
    render: (a, l) => (
      <>
        <rect x="8" y="8" width="304" height="354" rx="26" fill="#fff" stroke={a} strokeWidth="5" strokeDasharray="3 9" />
        <text x="160" y="340" textAnchor="middle" fontFamily={DISPLAY} fontSize="23" fontWeight="800" fill={a}>{l}</text>
      </>
    ),
  },
};

/* ---------- brand pieces ---------- */
function Mark({ color = "currentColor" }: { color?: string }) {
  return (
    <g>
      <path d="M8 22V14a6 6 0 0 1 6-6h8M42 8h8a6 6 0 0 1 6 6v8M56 42v8a6 6 0 0 1-6 6h-8M22 56h-8a6 6 0 0 1-6-6v-8" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <rect x="20" y="20" width="10" height="10" rx="2.5" fill={color} />
      <rect x="34" y="20" width="10" height="10" rx="2.5" fill={color} />
      <rect x="20" y="34" width="10" height="10" rx="2.5" fill={color} />
      <circle cx="39" cy="39" r="5" fill="#FFB300" />
    </g>
  );
}

function Logo({ markColor, textColor, width = 190 }: { markColor: string; textColor: string; width?: number }) {
  return (
    <svg width={width} height={width * (64 / 272)} viewBox="0 0 272 64" role="img" aria-label="ScanFrame">
      <Mark color={markColor} />
      <text x="78" y="43" fontFamily={DISPLAY} fontSize="34" fontWeight="800" letterSpacing="-1" fill={textColor}>ScanFrame</text>
    </svg>
  );
}

function Badge({ size = 110 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Print-ready, vector SVG, scan-tested">
      <circle cx="100" cy="100" r="98" fill="#3A3CFF" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 5" />
      <defs>
        <path id="badge-circle" d="M28 100a72 72 0 1 1 144 0a72 72 0 1 1-144 0" />
      </defs>
      <text fontFamily={DISPLAY} fontSize="13" fontWeight="700" fill="#fff">
        <textPath href="#badge-circle" textLength="440" lengthAdjust="spacing">PRINT-READY  ·  VECTOR SVG  ·  SCAN-TESTED  ·  </textPath>
      </text>
      <g transform="translate(64 64) scale(1.125)">
        <Mark color="#fff" />
      </g>
    </svg>
  );
}

function AppIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#3A3CFF" />
      <Mark color="#fff" />
    </svg>
  );
}

/* ---------- QR + frame ---------- */
const QUIET = 4; // modules of blank margin that frames must never cover

type QRFrameProps = {
  frame: FrameKey;
  accent: string;
  label: string;
  text?: string;
  placeholder?: boolean;
  qrSize?: number;
  outputWidth?: number;
  logoImage?: string | null;
  logoSize?: number;
};

const QRFrame = forwardRef<SVGSVGElement, QRFrameProps>(function QRFrame(
  { frame, accent, label, text = "", placeholder, qrSize = 100, outputWidth, logoImage, logoSize = 20 },
  ref,
) {
  const f = FRAMES[frame];
  const [qx, qy, qs] = f.q;
  const scaledQrSize = (qs * qrSize) / 100;
  const qrX = qx + (qs - scaledQrSize) / 2;
  const qrY = qy + (qs - scaledQrSize) / 2;

  const qr = useMemo(() => {
    if (placeholder) return null;
    const m = QRCode.create(text || " ", { errorCorrectionLevel: logoImage ? "H" : "Q" }).modules;
    let d = "";
    for (let y = 0; y < m.size; y++) for (let x = 0; x < m.size; x++) if (m.data[y * m.size + x]) d += `M${x} ${y}h1v1h-1z`;
    return { d, n: m.size };
  }, [text, placeholder, logoImage]);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${f.w} ${f.h}`}
      width={outputWidth}
      height={outputWidth ? Math.round((outputWidth * f.h) / f.w) : undefined}
    >
      {f.render(accent, label)}
      {qr ? (
        <g transform={`translate(${qrX} ${qrY}) scale(${scaledQrSize / (qr.n + QUIET * 2)})`}>
          <rect width={qr.n + QUIET * 2} height={qr.n + QUIET * 2} fill="#fff" />
          <path d={qr.d} transform={`translate(${QUIET} ${QUIET})`} fill="#101223" shapeRendering="crispEdges" />
          {logoImage && (() => {
            const logoSide = (qr.n * logoSize) / 100;
            const logoPadding = logoSide * 0.12;
            const logoX = QUIET + (qr.n - logoSide) / 2;
            const logoY = QUIET + (qr.n - logoSide) / 2;
            return (
              <>
                <rect
                  x={logoX - logoPadding}
                  y={logoY - logoPadding}
                  width={logoSide + logoPadding * 2}
                  height={logoSide + logoPadding * 2}
                  rx={logoPadding}
                  fill="#fff"
                />
                <image
                  href={logoImage}
                  x={logoX}
                  y={logoY}
                  width={logoSide}
                  height={logoSide}
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label="Uploaded center image"
                />
              </>
            );
          })()}
        </g>
      ) : (
        <rect x={qrX} y={qrY} width={scaledQrSize} height={scaledQrSize} rx="6" fill="#fff" stroke="#101223" strokeWidth="6" strokeDasharray="14 10" />
      )}
    </svg>
  );
});

/* ---------- export helpers ---------- */
function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

function svgToString(svg: SVGSVGElement) {
  return new XMLSerializer().serializeToString(svg);
}

function exportSvg(svg: SVGSVGElement) {
  const url = URL.createObjectURL(new Blob([svgToString(svg)], { type: "image/svg+xml" }));
  download(url, "scanframe.svg");
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportPdf(svg: SVGSVGElement, filename = "qr-frame.pdf") {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import("jspdf"), import("svg2pdf.js")]);
  const vb = svg.viewBox.baseVal;
  const pdf = new jsPDF({ unit: "pt", format: [vb.width, vb.height] });
  await svg2pdf(svg, pdf, { x: 0, y: 0, width: vb.width, height: vb.height });
  pdf.save(filename);
}

function exportPng(svg: SVGSVGElement, widthPx = 2000) {
  const vb = svg.viewBox.baseVal;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = widthPx;
    c.height = Math.round((widthPx * vb.height) / vb.width);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    download(c.toDataURL("image/png"), "scanframe.png");
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgToString(svg));
}

/* ---------- app ---------- */
export default function App() {
  const [cat, setCat] = useState<CatKey>("essentials");
  const [frame, setFrame] = useState<FrameKey>("default");
  const [label, setLabel] = useState(CATS.essentials.label);
  const [accent, setAccent] = useState("#3a3cff");
  const [frameWidth, setFrameWidth] = useState(1200);
  const [qrSize, setQrSize] = useState(100);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const [logoError, setLogoError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<UploadType, UploadedFile>>>({});
  const [fileError, setFileError] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [fileRemoving, setFileRemoving] = useState(false);
  const fileUploadId = useRef(0);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"content" | "frame" | "colors" | "advanced">("content");
  const [search, setSearch] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const c = CATS[cat];
  const activeUploadedFile = c.fileType ? uploadedFiles[c.fileType] : undefined;
  const payload = useMemo(() => {
    if (c.fileType) return uploadedFiles[c.fileType]?.url || "";
    const v: Record<string, string> = {};
    c.fields.forEach((f) => (v[f.key] = vals[f.key] || f.placeholder));
    return c.build(v);
  }, [c, uploadedFiles, vals]);
  const isReady = c.fileType ? Boolean(activeUploadedFile) : c.fields.every((field) => Boolean(vals[field.key]?.trim()));
  const categoryKeys = (Object.keys(CATS) as CatKey[]).filter((key) =>
    CATS[key].name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function pickCat(k: CatKey) {
    setCat(k);
    setVals({});
    setLabel(CATS[k].label);
    setFileError("");
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !BLOB_UPLOADS_ENABLED) return;
    const uploadType = c.fileType;
    if (!uploadType) return;
    const expectedType = uploadType === "image" ? "image/" : "application/pdf";
    if (uploadType === "image" ? !file.type.startsWith(expectedType) : file.type !== expectedType) {
      setFileError(uploadType === "image" ? "Choose an image file." : "Choose a PDF file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setFileError("Choose a file no larger than 3 MB.");
      return;
    }

    const uploadId = ++fileUploadId.current;
    setFileUploading(true);
    setFileError("");
    try {
      const sessionResponse = await fetch("/api/blob-session");
      const session = await sessionResponse.json() as { ownerId?: string; error?: string };
      if (!sessionResponse.ok || !session.ownerId) throw new Error(session.error || "Could not start an upload session.");

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "upload";
      const blob = await upload(`scanframe/${session.ownerId}/${uploadType}/${crypto.randomUUID()}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        clientPayload: JSON.stringify({ type: uploadType, ownerId: session.ownerId }),
      });
      if (uploadId === fileUploadId.current) {
        setUploadedFiles((current) => ({ ...current, [uploadType]: { url: blob.url, name: file.name } }));
      }
    } catch (error) {
      if (uploadId === fileUploadId.current) {
        const message = error instanceof Error ? error.message : "The file could not be uploaded. Try again.";
        setFileError(message.includes("Failed to retrieve the client token")
          ? "The upload API could not provide a Blob token. Check BLOB_READ_WRITE_TOKEN in .env.local or Vercel settings, then restart the app or redeploy."
          : message);
      }
    } finally {
      if (uploadId === fileUploadId.current) setFileUploading(false);
    }
  }

  async function handleRemoveUploadedFile() {
    if (!c.fileType || !activeUploadedFile) return;
    const uploadType = c.fileType;
    const fileToRemove = activeUploadedFile;
    setFileRemoving(true);
    setFileError("");
    try {
      const response = await fetch("/api/blob-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fileToRemove.url }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "The uploaded file could not be removed.");
      setUploadedFiles((current) => {
        if (current[uploadType]?.url !== fileToRemove.url) return current;
        const next = { ...current };
        delete next[uploadType];
        return next;
      });
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "The uploaded file could not be removed.");
    } finally {
      setFileRemoving(false);
    }
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setLogoError("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setLogoError("Choose an image smaller than 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoImage(reader.result);
        setLogoError("");
      }
    };
    reader.onerror = () => setLogoError("The image could not be read. Try another file.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="wrap">
      <header>
        <div className="brand">
          <svg viewBox="0 0 64 64" aria-hidden="true" style={{ color: "var(--blue)" }}>
            <Mark />
          </svg>
          ScanFrame
        </div>
        <div className="header-note"><span className="privacy-dot" />No account needed</div>
        <span className="header-badge">Free QR studio</span>
      </header>

      <main>
        <div className="intro">
          <div className="eyebrow"><span className="eyebrow-icon">⌁</span> QR CODE STUDIO <span className="eyebrow-line" /></div>
          <h1>Make your link <em>scannable.</em></h1>
          <p className="lead">Create QR codes for links, contact details, places, and messages. Style each one to match your brand and download a print-ready file.</p>
          <div className="use-tags"><span>Posters &amp; flyers</span><span>Packaging</span><span>Signage</span><span>Digital menus</span></div>
          <a className="promo-jump" href="#promo-preview">Watch a 5-second preview <span aria-hidden="true">↓</span></a>
        </div>

        <section className="app">
          <div className="panel">
            <div className="panel-heading">
              <div><span className="step-label">STEP 01</span><h2>Build your code</h2></div>
              <button className="reset-button" onClick={() => { setVals({}); setFileError(""); setLabel(CATS[cat].label); setFrame("default"); setAccent("#3a3cff"); setFrameWidth(1200); setQrSize(100); setLogoImage(null); setLogoSize(20); setLogoError(""); }}>↺ <span>Reset</span></button>
            </div>
            <div className="editor-tabs" role="tablist" aria-label="QR code settings">
              {(["content", "frame", "colors", "advanced"] as const).map((tab) => (
                <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "editor-tab active" : "editor-tab"} onClick={() => setActiveTab(tab)}>
                  <span className="tab-icon">{{ content: "⌗", frame: "▣", colors: "◉", advanced: "⚙" }[tab]}</span>{tab === "colors" ? "Colors" : tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="editor-content">
              {activeTab === "content" && <>
                <div className="section-label"><span>Choose content type</span><span className="section-count">{categoryKeys.length} available</span></div>
                <div className="category-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search content types" placeholder="Search content types..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <div className="chips" role="group" aria-label="Category">
                  {categoryKeys.map((k) => (
                    <button key={k} className="chip" aria-pressed={k === cat} disabled={!BLOB_UPLOADS_ENABLED && (k === "image" || k === "pdf")} onClick={() => pickCat(k)}>
                      <span className="chip-icon">{({ essentials: "↗", shops: "◇", gifting: "✳", contacts: "♙", wifi: "⌁", events: "▦", food: "◒", phone: "☎", email: "@", sms: "✉", location: "⌖", text: "T", image: "▧", pdf: "▤" } as Record<CatKey, string>)[k]}</span>{CATS[k].name}
                    </button>
                  ))}
                  {categoryKeys.length === 0 && <p className="empty-search">No content types match “{search}”.</p>}
                </div>
                <div className="divider" />
                <div className="section-label"><span>{CATS[cat].name} details</span></div>
                {c.fileType ? <div className="field-wrap">
                  <label htmlFor="content-file">Upload {c.fileType === "image" ? "image" : "PDF"}</label>
                  <input id="content-file" type="file" accept={c.fileType === "image" ? "image/png,image/jpeg,image/webp" : "application/pdf,.pdf"} aria-describedby="content-file-help" onChange={handleFileUpload} disabled={!BLOB_UPLOADS_ENABLED || fileUploading || fileRemoving || Boolean(activeUploadedFile)} />
                  <p id="content-file-help" className="field-hint">{BLOB_UPLOADS_ENABLED ? "Upload a PNG, JPG, WebP, or PDF up to 3 MB. The public link can be opened by anyone with the QR code. Removing the file also deletes it from storage." : "New image and PDF uploads are currently disabled in config/features.ts."}</p>
                  {fileUploading && <p className="field-hint" role="status">Uploading to Vercel Blob…</p>}
                  {fileRemoving && <p className="field-hint" role="status">Removing file from Vercel Blob…</p>}
                  {activeUploadedFile && <>
                    <p className="field-hint">Uploaded: <strong>{activeUploadedFile.name}</strong> · <a href={activeUploadedFile.url} target="_blank" rel="noreferrer">Open public file</a></p>
                    <button type="button" className="remove-logo" disabled={fileRemoving || fileUploading} onClick={handleRemoveUploadedFile}>Remove uploaded file</button>
                  </>}
                  {fileError && <p className="logo-error" role="alert">{fileError}</p>}
                </div> : c.fields.map((f) => (
                  <div key={`${cat}-${f.key}`} className="field-wrap">
                    <label htmlFor={`f_${f.key}`}>{f.label}</label>
                    <input
                      type="text"
                      id={`f_${f.key}`}
                      placeholder={f.placeholder}
                      value={vals[f.key] ?? ""}
                      onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
                    />
                    {f.key === "url" && <p className="field-hint">Include <strong>https://</strong> so every camera recognizes it as a web address.</p>}
                  </div>
                ))}
              </>}

              {activeTab === "frame" && <>
                <div className="section-label"><span>Choose a frame</span><span className="section-count">{Object.keys(FRAMES).length} styles</span></div>
                <div className="frames">
                  {(Object.keys(FRAMES) as FrameKey[]).map((k) => (
                    <button key={k} className="fr" aria-pressed={k === frame} onClick={() => setFrame(k)}>
                      <QRFrame frame={k} accent={accent} label="SCAN" placeholder />
                      {FRAMES[k].name}
                    </button>
                  ))}
                </div>
                {frame !== "default" && <div className="field-wrap"><label htmlFor="lab">Frame label</label><input type="text" id="lab" maxLength={18} value={label} onChange={(e) => setLabel(e.target.value)} /></div>}
                <div className="size-control">
                  <div className="size-control-heading"><label htmlFor="frame-width">Frame export width</label><output htmlFor="frame-width">{frameWidth} px</output></div>
                  <input id="frame-width" type="range" min="500" max="2400" step="100" value={frameWidth} onChange={(e) => setFrameWidth(Number(e.target.value))} />
                  <p>Export width; height adjusts to match the selected frame.</p>
                </div>
                <div className="size-control">
                  <div className="size-control-heading"><label htmlFor="qr-size">QR code size</label><output htmlFor="qr-size">{qrSize}%</output></div>
                  <input id="qr-size" type="range" min="65" max="100" step="1" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} />
                  <p>Adjust the code inside its frame while keeping it centered.</p>
                </div>
                <div className="helper-card"><span>✦</span><div><strong>Keep it easy to scan</strong><p>Leave a clear margin around the code and use a strong contrast between the frame and its background.</p></div></div>
              </>}

              {activeTab === "colors" && <>
                <div className="section-label"><span>Brand color</span><span className="section-count">Frame &amp; accents</span></div>
                <div className="color-picker-row"><input type="color" id="col" value={accent} onChange={(e) => setAccent(e.target.value)} /><div><label htmlFor="col">Accent color</label><p>{accent.toUpperCase()}</p></div></div>
                <div className="color-swatches" aria-label="Suggested colors">
                  {["#3a3cff", "#111827", "#087e68", "#d84b37", "#7c3aed", "#0e7490"].map((color) => <button key={color} aria-label={`Use ${color}`} title={color} style={{ background: color, boxShadow: accent === color ? "0 0 0 3px var(--card), 0 0 0 5px var(--blue)" : undefined }} onClick={() => setAccent(color)} />)}
                </div>
                <div className="logo-upload">
                  <label htmlFor="center-image">Center image</label>
                  <input id="center-image" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="center-image-help" onChange={handleLogoUpload} />
                  <p id="center-image-help">Add a PNG, JPG, or WebP logo (up to 3 MB). It will be embedded in your download.</p>
                  {logoError && <p className="logo-error" role="alert">{logoError}</p>}
                  {logoImage && <>
                    <div className="size-control">
                      <div className="size-control-heading"><label htmlFor="logo-size">Logo size</label><output htmlFor="logo-size">{logoSize}%</output></div>
                      <input id="logo-size" type="range" min="12" max="24" step="1" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} />
                    </div>
                    <button type="button" className="remove-logo" onClick={() => { setLogoImage(null); setLogoError(""); }}>Remove image</button>
                  </>}
                </div>
                <div className="helper-card"><span>◐</span><div><strong>Contrast helps every scan</strong><p>Dark frames against a light background are the most reliable choice for printed codes.</p></div></div>
              </>}

              {activeTab === "advanced" && <>
                <div className="section-label"><span>Code settings</span></div>
                <div className="setting-row"><div><strong>Error correction</strong><p>Extra recovery data helps the code scan if it is partly damaged.</p></div><span className="setting-value">High · {logoImage ? "H" : "Q"}</span></div>
                <div className="setting-row"><div><strong>QR type</strong><p>This code stores the content directly in the pattern.</p></div><span className="setting-value">Static</span></div>
                <div className="helper-card"><span>ⓘ</span><div><strong>Check before printing</strong><p>Scan a proof at its final size and on the material you plan to use.</p></div></div>
              </>}
            </div>
          </div>

          <div className="panel preview-panel">
            <div className="panel-heading">
              <div><span className="step-label">STEP 02</span><h2>Preview &amp; download</h2></div>
              <span className="live-badge"><span className="privacy-dot" /> Live preview</span>
            </div>
              <div className="preview-meta"><span>{CATS[cat].name} QR code</span><button className="icon-button" aria-label="Reset preview" title="Reset preview" onClick={() => { setVals({}); setFileError(""); }}>↺</button></div>
            <div className={`stage ${!isReady ? "stage-empty" : ""}`}>
              <QRFrame ref={svgRef} frame={frame} accent={accent} label={label} text={payload} placeholder={!isReady} qrSize={qrSize} outputWidth={frameWidth} logoImage={logoImage} logoSize={logoSize} />
              {!isReady && <div className="stage-prompt"><span className="prompt-icon">⌗</span><strong>Your QR code will appear here</strong><span>Add your content to get started</span></div>}
            </div>
            <div className="scan-note"><span>✓</span> Your code is generated privately in your browser</div>
            <div className="btns">
              <button className="btn" disabled={!isReady} onClick={() => svgRef.current && exportPng(svgRef.current, frameWidth)}><span>↓</span> Download PNG</button>
              <button className="btn alt" disabled={!isReady} onClick={() => svgRef.current && exportSvg(svgRef.current)}>SVG</button>
              <button className="btn alt" disabled={!isReady} onClick={() => svgRef.current && void exportPdf(svgRef.current)}>PDF</button>
            </div>
            <p className="download-note">High-resolution PNG, scalable SVG, and print-ready PDF · Free to use</p>
          </div>
        </section>

        <PromoPreview />

        <section className="kit">
          <h2>Brand kit</h2>
          <div className="kitgrid">
            <div className="tile t1"><Logo markColor="#3A3CFF" textColor="#101223" />Logo</div>
            <div className="tile t2"><Logo markColor="#fff" textColor="#fff" />Logo on blue</div>
            <div className="tile t3"><Badge />Badge</div>
            <div className="tile t4">
              <div className="sizes">
                <AppIcon size={64} />
                <AppIcon size={32} />
                <AppIcon size={16} />
              </div>
              Favicon and app icon
            </div>
          </div>
          <div className="sw">
            <span style={{ background: "#3A3CFF", color: "#fff" }}>Ultramarine<br />#3A3CFF</span>
            <span style={{ background: "#FFB300" }}>Marigold<br />#FFB300</span>
            <span style={{ background: "#101223", color: "#fff" }}>Ink<br />#101223</span>
            <span style={{ background: "#F3F4FB" }}>Mist<br />#F3F4FB</span>
          </div>
        </section>
      </main>

      <footer>
        <div>Always test-scan your final design at print size before sending it to the printer.</div>
        <div className="creator-credit">Created by <a href="https://github.com/flappycodes" target="_blank" rel="noreferrer">flappycodes</a></div>
      </footer>
    </div>
  );
}
