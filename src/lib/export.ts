function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function exportSvg(svg: SVGSVGElement, filename = "qr-frame.svg") {
  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  download(url, filename);
  URL.revokeObjectURL(url);
}

export function exportPng(svg: SVGSVGElement, widthPx = 2000, filename = "qr-frame.png") {
  const vb = svg.viewBox.baseVal;
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = Math.round((widthPx * vb.height) / vb.width);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    download(canvas.toDataURL("image/png"), filename);
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
}