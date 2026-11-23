import { forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import "./App.css";

/* ---------- types ---------- */
type CatKey = "essentials" | "shops" | "gifting" | "contacts" | "wifi" | "events" | "food";
type FrameKey = "default" | "box" | "pointer" | "hand";
type Field = { key: string; label: string; placeholder: string };
type Cat = {
  name: string;
  label: string;
  fields: Field[];
  build: (v: Record<string, string>) => string;
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

type QRFrameProps = { frame: FrameKey; accent: string; label: string; text?: string; placeholder?: boolean };

const QRFrame = forwardRef<SVGSVGElement, QRFrameProps>(function QRFrame({ frame, accent, label, text = "", placeholder }, ref) {
  const f = FRAMES[frame];
  const [qx, qy, qs] = f.q;

  const qr = useMemo(() => {
    if (placeholder) return null;
    const m = QRCode.create(text || " ", { errorCorrectionLevel: "Q" }).modules;
    let d = "";
    for (let y = 0; y < m.size; y++) for (let x = 0; x < m.size; x++) if (m.data[y * m.size + x]) d += `M${x} ${y}h1v1h-1z`;
    return { d, n: m.size };
  }, [text, placeholder]);

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${f.w} ${f.h}`}>
      {f.render(accent, label)}
      {qr ? (
        <g transform={`translate(${qx} ${qy}) scale(${qs / (qr.n + QUIET * 2)})`}>
          <rect width={qr.n + QUIET * 2} height={qr.n + QUIET * 2} fill="#fff" />
          <path d={qr.d} transform={`translate(${QUIET} ${QUIET})`} fill="#101223" shapeRendering="crispEdges" />
        </g>
      ) : (
        <rect x={qx} y={qy} width={qs} height={qs} rx="6" fill="#fff" stroke="#101223" strokeWidth="6" strokeDasharray="14 10" />
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
  const [vals, setVals] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"content" | "frame" | "colors" | "advanced">("content");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const c = CATS[cat];
  const payload = useMemo(() => {
    const v: Record<string, string> = {};
    c.fields.forEach((f) => (v[f.key] = vals[f.key] || f.placeholder));
    return c.build(v);
  }, [c, vals]);
  const isReady = c.fields.every((field) => Boolean(vals[field.key]?.trim()));
  const categoryKeys = (Object.keys(CATS) as CatKey[]).filter((key) =>
    CATS[key].name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function pickCat(k: CatKey) {
    setCat(k);
    setVals({});
    setLabel(CATS[k].label);
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
        <div className="header-note"><span className="privacy-dot" /> Private by default · no account needed</div>
        <button className="pill" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </header>

      <main>
        <div className="intro">
          <div className="eyebrow"><span className="eyebrow-icon">⌁</span> QR CODE STUDIO <span className="eyebrow-line" /></div>
          <h1>Make your link <em>scannable.</em></h1>
          <p className="lead">Turn a link into a QR code, style it to match your brand, and download a print-ready file.</p>
          <div className="use-tags"><span>Posters &amp; flyers</span><span>Packaging</span><span>Signage</span><span>Digital menus</span></div>
        </div>

        <section className="app">
          <div className="panel">
            <div className="panel-heading">
              <div><span className="step-label">STEP 01</span><h2>Build your code</h2></div>
              <button className="reset-button" onClick={() => { setVals({}); setLabel(CATS[cat].label); setFrame("default"); setAccent("#3a3cff"); }}>↺ <span>Reset</span></button>
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
                    <button key={k} className="chip" aria-pressed={k === cat} onClick={() => pickCat(k)}>
                      <span className="chip-icon">{({ essentials: "↗", shops: "◇", gifting: "✳", contacts: "♙", wifi: "⌁", events: "▦", food: "◒" } as Record<CatKey, string>)[k]}</span>{CATS[k].name}
                    </button>
                  ))}
                  {categoryKeys.length === 0 && <p className="empty-search">No content types match “{search}”.</p>}
                </div>
                <div className="divider" />
                <div className="section-label"><span>{CATS[cat].name} details</span></div>
                {c.fields.map((f) => (
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
                <div className="section-label"><span>Choose a frame</span><span className="section-count">4 styles</span></div>
                <div className="frames">
                  {(Object.keys(FRAMES) as FrameKey[]).map((k) => (
                    <button key={k} className="fr" aria-pressed={k === frame} onClick={() => setFrame(k)}>
                      <QRFrame frame={k} accent={accent} label="SCAN" placeholder />
                      {FRAMES[k].name}
                    </button>
                  ))}
                </div>
                {frame !== "default" && <div className="field-wrap"><label htmlFor="lab">Frame label</label><input type="text" id="lab" maxLength={18} value={label} onChange={(e) => setLabel(e.target.value)} /></div>}
                <div className="helper-card"><span>✦</span><div><strong>Keep it easy to scan</strong><p>Leave a clear margin around the code and use a strong contrast between the frame and its background.</p></div></div>
              </>}

              {activeTab === "colors" && <>
                <div className="section-label"><span>Brand color</span><span className="section-count">Frame &amp; accents</span></div>
                <div className="color-picker-row"><input type="color" id="col" value={accent} onChange={(e) => setAccent(e.target.value)} /><div><label htmlFor="col">Accent color</label><p>{accent.toUpperCase()}</p></div></div>
                <div className="color-swatches" aria-label="Suggested colors">
                  {["#3a3cff", "#111827", "#087e68", "#d84b37", "#7c3aed", "#0e7490"].map((color) => <button key={color} aria-label={`Use ${color}`} title={color} style={{ background: color, boxShadow: accent === color ? "0 0 0 3px var(--card), 0 0 0 5px var(--blue)" : undefined }} onClick={() => setAccent(color)} />)}
                </div>
                <div className="helper-card"><span>◐</span><div><strong>Contrast helps every scan</strong><p>Dark frames against a light background are the most reliable choice for printed codes.</p></div></div>
              </>}

              {activeTab === "advanced" && <>
                <div className="section-label"><span>Code settings</span></div>
                <div className="setting-row"><div><strong>Error correction</strong><p>Extra recovery data helps the code scan if it is partly damaged.</p></div><span className="setting-value">High · Q</span></div>
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
            <div className="preview-meta"><span>{CATS[cat].name} QR code</span><button className="icon-button" aria-label="Reset preview" title="Reset preview" onClick={() => setVals({})}>↺</button></div>
            <div className={`stage ${!isReady ? "stage-empty" : ""}`}>
              <QRFrame ref={svgRef} frame={frame} accent={accent} label={label} text={payload} placeholder={!isReady} />
              {!isReady && <div className="stage-prompt"><span className="prompt-icon">⌗</span><strong>Your QR code will appear here</strong><span>Add your content to get started</span></div>}
            </div>
            <div className="scan-note"><span>✓</span> Your code is generated privately in your browser</div>
            <div className="btns">
              <button className="btn" disabled={!isReady} onClick={() => svgRef.current && exportPng(svgRef.current)}><span>↓</span> Download PNG</button>
              <button className="btn alt" disabled={!isReady} onClick={() => svgRef.current && exportSvg(svgRef.current)}>SVG</button>
            </div>
            <p className="download-note">High-resolution PNG and scalable SVG · Free to use</p>
          </div>
        </section>

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

      <footer>Always test-scan your final design at print size before sending it to the printer.</footer>
    </div>
  );
}
