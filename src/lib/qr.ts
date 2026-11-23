import QRCode from "qrcode";

export type Ecc = "L" | "M" | "Q" | "H";

export function buildQrPath(text: string, ecc: Ecc = "Q") {
  const qr = QRCode.create(text || " ", { errorCorrectionLevel: ecc });
  const size = qr.modules.size;
  const data = qr.modules.data;
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[y * size + x]) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return { d, size };
}