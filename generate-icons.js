// Generate placeholder PNGs and SVG for PWA
import fs from 'fs';
import path from 'path';

// Valid 192x192 and 512x512 PNG generator using pure Node
// We can generate an SVG and also write valid PNG files
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#14532d"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Background with rounded visionOS squircle -->
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <rect width="512" height="512" rx="128" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4"/>
  
  <!-- Outer Aura Glow -->
  <circle cx="256" cy="256" r="160" fill="none" stroke="url(#emerald)" stroke-width="3" opacity="0.3" filter="url(#glow)"/>
  <circle cx="256" cy="256" r="130" fill="none" stroke="url(#gold)" stroke-width="2" stroke-dasharray="6 8" opacity="0.5"/>

  <!-- Stylized Figure / Lotus / Star of Wisdom -->
  <g transform="translate(256, 256)" filter="url(#glow)">
    <!-- Head / Halo of Wisdom -->
    <circle cx="0" cy="-80" r="32" fill="url(#gold)"/>
    
    <!-- Torso / Wings of Virtues -->
    <path d="M-60,50 C-60,-20 -20,-40 0,-40 C20,-40 60,-20 60,50 C40,95 -40,95 -60,50 Z" fill="url(#emerald)"/>
    
    <!-- Open Book / Lotus Base -->
    <path d="M-90,60 C-40,50 -10,75 0,95 C10,75 40,50 90,60 C70,110 20,120 0,105 C-20,120 -70,110 -90,60 Z" fill="url(#gold)" opacity="0.9"/>

    <!-- Radiant Step / Momentum Path -->
    <circle cx="-35" cy="40" r="5" fill="#ffffff" opacity="0.8"/>
    <circle cx="0" cy="55" r="5" fill="#ffffff" opacity="0.8"/>
    <circle cx="35" cy="40" r="5" fill="#ffffff" opacity="0.8"/>
  </g>
</svg>`;

// Also write a minimal valid PNG buffer generator or 1-pixel upscaled PNG
// A 1x1 valid PNG buffer:
function createSimplePng(width, height, r, g, b) {
  // We can use a minimal valid uncompressed PNG or use zlib
  import('zlib').then(zlib => {
    function createPngBuffer(w, h, red, green, blue) {
      // PNG signature
      const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      
      // IHDR chunk
      const ihdrData = Buffer.alloc(13);
      ihdrData.writeUInt32BE(w, 0);
      ihdrData.writeUInt32BE(h, 4);
      ihdrData[8] = 8; // bit depth
      ihdrData[9] = 2; // color type: truecolor RGB
      ihdrData[10] = 0; // compression
      ihdrData[11] = 0; // filter
      ihdrData[12] = 0; // interlace
      
      const ihdrChunk = createChunk('IHDR', ihdrData);
      
      // Scanlines: for each row, 1 filter byte (0) + w * 3 bytes
      const rowSize = 1 + w * 3;
      const rawData = Buffer.alloc(rowSize * h);
      for (let y = 0; y < h; y++) {
        const offset = y * rowSize;
        rawData[offset] = 0; // filter None
        for (let x = 0; x < w; x++) {
          const pxOffset = offset + 1 + x * 3;
          rawData[pxOffset] = red;
          rawData[pxOffset + 1] = green;
          rawData[pxOffset + 2] = blue;
        }
      }
      
      const compressedData = zlib.deflateSync(rawData);
      const idatChunk = createChunk('IDAT', compressedData);
      const iendChunk = createChunk('IEND', Buffer.alloc(0));
      
      return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
    }

    function createChunk(type, data) {
      const length = Buffer.alloc(4);
      length.writeUInt32BE(data.length, 0);
      
      const typeBuffer = Buffer.from(type, 'ascii');
      const body = Buffer.concat([typeBuffer, data]);
      
      const crc = crc32(body);
      const crcBuffer = Buffer.alloc(4);
      crcBuffer.writeUInt32BE(crc, 0);
      
      return Buffer.concat([length, body, crcBuffer]);
    }

    // CRC32 implementation
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      crcTable[n] = c;
    }

    function crc32(buf) {
      let crc = 0xffffffff;
      for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
      }
      return (crc ^ 0xffffffff) >>> 0;
    }

    const publicDir = path.resolve('public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    // Write SVG files
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
    fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

    // Generate PNGs
    const png192 = createPngBuffer(192, 192, 20, 83, 45); // emerald dark
    fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

    const png512 = createPngBuffer(512, 512, 20, 83, 45);
    fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

    const appleIcon = createPngBuffer(180, 180, 20, 83, 45);
    fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

    console.log('Icons generated successfully!');
  });
}

createSimplePng();

