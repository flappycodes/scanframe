# ScanFrame

ScanFrame is a browser-based QR code studio. Create a static QR code, customize its frame and accent color, preview it, and download it as a PNG or SVG.

**Try ScanFrame:** [scanframe-qrcode.vercel.app](https://scanframe-qrcode.vercel.app/)

Created by [flappycodes](https://github.com/flappycodes).

## Use the app

1. In **Build your code > Content**, choose what the QR code should contain:
   - **Essentials, Shops, Gifting, Events, Food & Drinks:** a link to a page, shop, gift, event, or menu.
   - **Contacts:** a name and phone number, encoded as a vCard.
   - **Wi-Fi:** a network name and password, encoded as a Wi-Fi QR payload.
   - **Phone, Email, SMS, and Location:** a phone number, email address, or map coordinates that open in a compatible device app.
   - **Plain text:** a short message displayed when scanned.
   - **Image upload and PDF upload:** create a temporary QR link to a file selected in the current browser session. These links are local to that browser and are not shareable with other devices.
2. Fill in the required fields. The live preview updates as you customize the design. Downloads stay disabled until the required fields are filled in.
3. Open **Frame** to choose one of twelve styles: Default, Box, Pointer tab, Hand drawn, Ticket, Corner marks, Round badge, Arch, Polaroid, Ribbon, Diamond, or Dashed border. For framed designs, you can also edit the label.
4. In **Frame**, adjust the export width from 500 to 2,400 pixels and the QR code size from 65% to 100%. The code remains centered; the exported height follows the selected frame's proportions.
5. In **Colors**, choose an accent color or select a suggested swatch. You can also add a PNG, JPG, or WebP image (up to 3 MB) in the QR code center and adjust its size.
6. In **Advanced**, review the code settings. QR codes are static and use Q-level error correction, or H-level error correction when a center image is added.
7. Download the design as a PNG, SVG, or PDF. The center image is embedded in the download. Use **Reset** to restore the content and design settings.

The **Brand kit** section below the builder displays the ScanFrame logo, badge, app icon, and brand colors.

## Privacy

QR content and uploaded files, including optional center images, are processed in the browser and are not uploaded by the app. Image and PDF QR links use temporary browser URLs and stop working when that browser session ends. Other QR content is stored directly; links are not shortened or redirected by ScanFrame.

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
