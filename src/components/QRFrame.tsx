import { forwardRef, useMemo } from "react";
import { buildQrPath, type Ecc } from "../lib/qr";
import type { FrameDef } from "../lib/frames";

type Props = {
  value: string;
  frame: FrameDef;
  fg?: string;
  bg?: string;
  accent?: string;
  label?: string;
  ecc?: Ecc;
};

const QUIET = 4; // modules of blank margin around the code

export const QRFrame = forwardRef<SVGSVGElement, Props>(function QRFrame(
  { value, frame, fg = "#111111", bg = "#ffffff", accent = "#e11d48", label = "SCAN ME", ecc = "Q" },
  ref
) {
  const { d, size } = useMemo(() => buildQrPath(value, ecc), [value, ecc]);
  const total = size + QUIET * 2;
  const scale = frame.qr.size / total;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      width="100%"
      style={{ maxWidth: 360 }}
    >
      {frame.render({ fg, bg, accent, label })}
      <g transform={`translate(${frame.qr.x} ${frame.qr.y}) scale(${scale})`}>
        <rect width={total} height={total} fill={bg} />
        <path d={d} transform={`translate(${QUIET} ${QUIET})`} fill={fg} shapeRendering="crispEdges" />
      </g>
    </svg>
  );
});