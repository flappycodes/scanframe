import type { ReactNode } from "react";

export type FrameProps = { fg: string; bg: string; accent: string; label: string };

export type FrameDef = {
  id: string;
  name: string;
  category: "essentials" | "shops" | "gifting" | "contacts" | "wifi" | "events" | "food";
  w: number;
  h: number;
  qr: { x: number; y: number; size: number };
  render: (p: FrameProps) => ReactNode;
};

const font = "system-ui, -apple-system, Segoe UI, sans-serif";

export const frames: FrameDef[] = [
  {
    id: "default",
    name: "Default layout",
    category: "essentials",
    w: 300,
    h: 300,
    qr: { x: 20, y: 20, size: 260 },
    render: ({ bg }) => <rect width="300" height="300" fill={bg} />,
  },
  {
    id: "box",
    name: "Box type",
    category: "essentials",
    w: 300,
    h: 370,
    qr: { x: 30, y: 30, size: 240 },
    render: ({ bg, accent, label }) => (
      <>
        <rect x="4" y="4" width="292" height="362" rx="18" fill={bg} stroke={accent} strokeWidth="8" />
        <rect x="4" y="290" width="292" height="76" rx="0" fill={accent} />
        <text x="150" y="338" textAnchor="middle" fontFamily={font} fontSize="28" fontWeight="700" fill="#fff">
          {label}
        </text>
      </>
    ),
  },
  {
    id: "pointer-tab",
    name: "Pointer tab",
    category: "essentials",
    w: 300,
    h: 380,
    qr: { x: 30, y: 90, size: 240 },
    render: ({ bg, accent, label }) => (
      <>
        <rect x="4" y="60" width="292" height="316" rx="16" fill={bg} stroke={accent} strokeWidth="8" />
        {/* tab with a pointer that aims down at the code */}
        <path d="M40 6 H260 a14 14 0 0 1 14 14 V50 a14 14 0 0 1 -14 14 H170 L150 82 L130 64 H40 a14 14 0 0 1 -14 -14 V20 a14 14 0 0 1 14 -14 Z" fill={accent} />
        <text x="150" y="44" textAnchor="middle" fontFamily={font} fontSize="24" fontWeight="700" fill="#fff">
          {label}
        </text>
      </>
    ),
  },
  {
    id: "hand-drawn",
    name: "Hand drawn",
    category: "essentials",
    w: 300,
    h: 370,
    qr: { x: 30, y: 30, size: 240 },
    render: ({ bg, accent, label }) => (
      <>
        <rect width="300" height="370" fill={bg} />
        {/* wobbly outline, two overlapping strokes for a sketchy feel */}
        <path d="M10 14 Q150 4 290 12 Q298 180 288 300 Q150 310 12 302 Q4 160 10 14 Z" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
        <path d="M14 10 Q152 16 286 8 Q292 170 292 304 Q148 296 8 306 Q10 150 14 10 Z" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <text x="150" y="346" textAnchor="middle" fontFamily="'Comic Sans MS','Segoe Print',cursive" fontSize="28" fill={accent}>
          {label}
        </text>
        <path d="M80 356 Q150 362 220 354" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  // Add category frames here: gift ribbon, Wi-Fi signal arcs, menu card, ticket stub, business card...
];