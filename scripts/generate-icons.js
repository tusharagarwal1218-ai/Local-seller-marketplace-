// Generates compliant PNG icons for PWA and Play Store TWA
import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writePngChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  // Create RGBA pixel buffer
  const rawRows = [];
  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // PNG filter type 0 (None)
    
    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      
      // Compute dist from center
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Warm Amber gradient background
      const t = (x + y) / (width + height);
      let r = Math.round(146 * (1 - t) + 69 * t);
      let g = Math.round(64 * (1 - t) + 26 * t);
      let b = Math.round(14 * (1 - t) + 3 * t);
      let a = 255;

      // Rounded rectangle for standard icons (unless maskable, which is full bleed)
      if (!isMaskable) {
        const cornerR = width * 0.22;
        const inLeft = x < cornerR;
        const inRight = x > width - cornerR;
        const inTop = y < cornerR;
        const inBottom = y > height - cornerR;

        if ((inLeft || inRight) && (inTop || inBottom)) {
          const cornerCx = inLeft ? cornerR : width - cornerR;
          const cornerCy = inTop ? cornerR : height - cornerR;
          const cdx = x - cornerCx;
          const cdy = y - cornerCy;
          if (cdx * cdx + cdy * cdy > cornerR * cornerR) {
            a = 0;
            r = 0;
            g = 0;
            b = 0;
          }
        }
      }

      if (a > 0) {
        // Draw Store Icon in safe center
        const storeMargin = isMaskable ? 0.30 : 0.22;
        const storeTop = height * storeMargin;
        const storeBottom = height * (1 - storeMargin);
        const storeLeft = width * storeMargin;
        const storeRight = width * (1 - storeMargin);

        // Store roof / awning
        const awningTop = height * (storeMargin + 0.05);
        const awningBottom = height * (storeMargin + 0.22);
        if (y >= awningTop && y <= awningBottom && x >= storeLeft && x <= storeRight) {
          // Alternating awning stripes
          const stripeWidth = (storeRight - storeLeft) / 5;
          const stripeIdx = Math.floor((x - storeLeft) / stripeWidth);
          if (stripeIdx % 2 === 0) {
            r = 245; g = 158; b = 11; // Amber 500
          } else {
            r = 180; g = 83; b = 9;   // Amber 700
          }
        }

        // Store body
        const bodyTop = awningBottom;
        const bodyBottom = height * (1 - storeMargin - 0.04);
        const bodyLeft = storeLeft + (storeRight - storeLeft) * 0.08;
        const bodyRight = storeRight - (storeRight - storeLeft) * 0.08;
        if (y > bodyTop && y <= bodyBottom && x >= bodyLeft && x <= bodyRight) {
          r = 254; g = 243; b = 199; // Warm cream storefront

          // Window
          const winTop = bodyTop + (bodyBottom - bodyTop) * 0.2;
          const winBottom = bodyTop + (bodyBottom - bodyTop) * 0.7;
          const winLeft = bodyLeft + (bodyRight - bodyLeft) * 0.12;
          const winRight = bodyLeft + (bodyRight - bodyLeft) * 0.48;
          if (y >= winTop && y <= winBottom && x >= winLeft && x <= winRight) {
            r = 217; g = 119; b = 6;
          }

          // Door
          const doorTop = bodyTop + (bodyBottom - bodyTop) * 0.2;
          const doorBottom = bodyBottom;
          const doorLeft = bodyLeft + (bodyRight - bodyLeft) * 0.60;
          const doorRight = bodyLeft + (bodyRight - bodyLeft) * 0.88;
          if (y >= doorTop && y <= doorBottom && x >= doorLeft && x <= doorRight) {
            r = 146; g = 64; b = 14;
          }
        }

        // Star accent top right
        const starX = width * 0.76;
        const starY = height * 0.24;
        const sDist = Math.hypot(x - starX, y - starY);
        if (sDist < width * 0.04) {
          r = 251; g = 191; b = 36;
        }
      }

      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rawRows.push(row);
  }

  const rawBuffer = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawBuffer);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression method: 0
  ihdrData[11] = 0; // Filter method: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = writePngChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = writePngChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = writePngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all target files
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, false));
fs.writeFileSync('public/favicon.ico', createPng(32, 32, false));

console.log('Successfully generated all PWA PNG icons!');
