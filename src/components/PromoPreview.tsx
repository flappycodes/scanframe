import { useState, type CSSProperties } from "react";

const GRID_SIZE = 21;
const FINDERS: [number, number][] = [[0, 0], [0, 14], [14, 0]];

function QRGrid() {
  return (
    <div className="promo-qr-grid" aria-hidden="true">
      {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
        const row = Math.floor(index / GRID_SIZE);
        const column = index % GRID_SIZE;
        const finder = FINDERS.find(([top, left]) => row >= top && row < top + 7 && column >= left && column < left + 7);
        let className = "promo-qr-cell";

        if (finder) {
          const localRow = row - finder[0];
          const localColumn = column - finder[1];
          const isDark = localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6 ||
            (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4);
          className += isDark ? " is-finder" : " is-finder-light";
        } else if ((row * 13 + column * 7 + row * column * 3) % 17 < 8) {
          className += " is-dark";
        }

        return <span key={index} className={className} style={{ "--cell-delay": `${index}ms` } as CSSProperties & { "--cell-delay": string }} />;
      })}
    </div>
  );
}

export default function PromoPreview() {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <section className="promo-preview" id="promo-preview" aria-labelledby="promo-preview-title">
      <div className="promo-heading">
        <div>
          <span className="promo-eyebrow">A QUICK LOOK</span>
          <h2 id="promo-preview-title">From link to scan in a few moments.</h2>
          <p>Design a QR code, make it yours, and share it anywhere.</p>
        </div>
        <button className="promo-replay" type="button" onClick={() => setReplayKey((key) => key + 1)}>Replay preview</button>
      </div>

      <div className="promo-scene" key={replayKey} aria-hidden="true">
        <div className="promo-browser">
          <div className="promo-browser-top">
            <div className="promo-window-dots"><i /><i /><i /></div>
            <span>ScanFrame Studio</span>
            <span className="promo-private"><i /> No account needed</span>
          </div>
          <div className="promo-workspace">
            <div className="promo-editor">
              <span className="promo-label">YOUR DESTINATION</span>
              <div className="promo-link"><span>scanframe.app/menu</span><b aria-hidden="true">↗</b></div>
              <span className="promo-label">YOUR STYLE</span>
              <div className="promo-swatches" aria-hidden="true"><i /><i /><i /><i /></div>
              <span className="promo-ready">READY TO SHARE</span>
            </div>
            <div className="promo-preview-code">
              <div className="promo-frame">
                <QRGrid />
                <div className="promo-center-logo">SF</div>
                <div className="promo-scan-line" />
              </div>
              <span className="promo-label">LIVE PREVIEW</span>
            </div>
          </div>
          <div className="promo-browser-footer"><span>✓</span> Print-ready. Scan-tested. Yours.</div>
        </div>
        <div className="promo-caption promo-caption-one">One link.</div>
        <div className="promo-caption promo-caption-two">Your style.</div>
        <div className="promo-caption promo-caption-three">Ready to scan.</div>
      </div>
      <p className="sr-only">A short animated preview of a link becoming a branded ScanFrame QR code.</p>
    </section>
  );
}
