# ScanFrame

ScanFrame is a QR code studio. Create a static QR code, customize its frame and accent color, preview it, and download it as a PNG, SVG, or PDF.

**Try ScanFrame:** [scanframe-qrcode.vercel.app](https://scanframe-qrcode.vercel.app/)

Created by [flappycodes](https://github.com/flappycodes).

## Use the app

1. In **Build your code > Content**, choose what the QR code should contain:
   - **Essentials, Shops, Gifting, Events, Food & Drinks:** a link to a page, shop, gift, event, or menu.
   - **Contacts:** a name and phone number, encoded as a vCard.
   - **Wi-Fi:** a network name and password, encoded as a Wi-Fi QR payload.
   - **Phone, Email, SMS, and Location:** a phone number, email address, or map coordinates that open in a compatible device app.
   - **Plain text:** a short message displayed when scanned.
   - **Image upload and PDF upload:** upload a PNG, JPG, WebP, or PDF up to 3 MB to the connected public Vercel Blob store. The QR code points to the public file URL. **Remove uploaded file** deletes the object from Blob storage; use the same browser that uploaded it. The QR link stops working.
2. Fill in the required fields. The live preview updates as you customize the design. Downloads stay disabled until the required fields are filled in.
3. Open **Frame** to choose one of twelve styles: Default, Box, Pointer tab, Hand drawn, Ticket, Corner marks, Round badge, Arch, Polaroid, Ribbon, Diamond, or Dashed border. For framed designs, you can also edit the label.
4. In **Frame**, adjust the export width from 500 to 2,400 pixels and the QR code size from 65% to 100%. The code remains centered; the exported height follows the selected frame's proportions.
5. In **Colors**, choose an accent color or select a suggested swatch. You can also add a PNG, JPG, or WebP image (up to 3 MB) in the QR code center and adjust its size.
6. In **Advanced**, review the code settings. QR codes are static and use Q-level error correction, or H-level error correction when a center image is added.
7. Download the design as a PNG, SVG, or PDF. The center image is embedded in the download. Use **Reset** to restore the content and design settings.

The **Brand kit** section below the builder displays the ScanFrame logo, badge, app icon, and brand colors.

## Privacy

QR content is generated in the browser. Image and PDF uploads are stored in Vercel Blob under `scanframe/image/` or `scanframe/pdf/`. These files are public: anyone who scans or receives the QR code can access them. The optional center logo is processed locally and is not uploaded. Other QR content is stored directly; links are not shortened or redirected by ScanFrame.

Download events are written to Vercel Function runtime logs with the format (`png`, `svg`, or `pdf`) and generated filename. QR content and user identifiers are not included. View them in the Vercel project’s **Logs** section by searching for `qr-download`.

## Vercel Blob setup

Connect a **public** Blob store to the Vercel project and set `BLOB_READ_WRITE_TOKEN` in the Vercel project environment settings for each environment you use. The upload endpoint reads this token on the server; `BLOB_STORE_ID` is not required by this endpoint. Never expose the read/write token through a `VITE_` variable or commit its value. Redeploy after changing the environment variable.

To pause new image and PDF uploads, set `BLOB_UPLOADS_ENABLED` to `false` in `config/features.ts`, then rebuild and redeploy. The UI disables the upload picker and the API rejects upload requests; the remove action remains available.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal. Its local middleware serves `/api/blob-upload`, so uploads work with `npm run dev` without `vercel dev`. To get the token locally, link the project with `npx vercel link` and pull its development environment with `npx vercel env pull .env.local`. The `.env.local` file is ignored by Git and must stay out of source control.

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
