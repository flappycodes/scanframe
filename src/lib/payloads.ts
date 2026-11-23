export const payloads = {
  url: (u: string) => u,

  wifi: (ssid: string, password: string, type: "WPA" | "WEP" | "nopass" = "WPA") => {
    const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
    return `WIFI:T:${type};S:${esc(ssid)};P:${esc(password)};;`;
  },

  contact: (c: { name: string; phone?: string; email?: string; org?: string }) =>
    [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${c.name}`,
      c.org ? `ORG:${c.org}` : "",
      c.phone ? `TEL:${c.phone}` : "",
      c.email ? `EMAIL:${c.email}` : "",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n"),

  event: (e: { title: string; start: string; end: string; location?: string }) =>
    // start/end format: 20261231T180000Z
    [
      "BEGIN:VEVENT",
      `SUMMARY:${e.title}`,
      `DTSTART:${e.start}`,
      `DTEND:${e.end}`,
      e.location ? `LOCATION:${e.location}` : "",
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\n"),
};