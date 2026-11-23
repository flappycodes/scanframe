# ScanFrame

ScanFrame is a browser-based QR code studio. Create a static QR code, customize its frame and accent color, preview it, and download it as a PNG or SVG.

**Try ScanFrame:** [scanframe-qrcode.vercel.app](https://scanframe-qrcode.vercel.app/)

## Use the app

1. In **Build your code > Content**, choose what the QR code should contain:
   - **Essentials, Shops, Gifting, Events, Food & Drinks:** a link to a page, shop, gift, event, or menu.
   - **Contacts:** a name and phone number, encoded as a vCard.
   - **Wi-Fi:** a network name and password, encoded as a Wi-Fi QR payload.
2. Fill in the required fields. The live preview updates as you customize the design. Downloads stay disabled until the required fields are filled in.
3. Open **Frame** to choose one of eight styles: Default, Box, Pointer tab, Hand drawn, Ticket, Corner marks, Round badge, or Arch. For framed designs, you can also edit the label.
4. In **Frame**, adjust the export width from 500 to 2,400 pixels and the QR code size from 65% to 100%. The code remains centered; the exported height follows the selected frame's proportions.
5. In **Colors**, choose an accent color or select a suggested swatch.
6. In **Advanced**, review the code settings. QR codes are static and use Q-level error correction.
7. Download the design as a PNG or SVG. Use **Reset** to restore the content, frame, color, and size settings.

The **Brand kit** section below the builder displays the ScanFrame logo, badge, app icon, and brand colors.

## Privacy

QR content is encoded in the browser and is not uploaded by the app. The generated QR code stores the content you entered directly; links encoded in a QR code are not shortened or redirected by ScanFrame.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Project commands

```bash
npm run build    # Type-check and create a production build in dist/
npm run lint     # Run Oxlint
npm run preview  # Serve the production build locally
```

## Tech stack

- React and TypeScript
- Vite
- [`qrcode`](https://www.npmjs.com/package/qrcode) for QR encoding
- Hand-built SVG frames and SVG/Canvas exports
