// Generates PNG icons for the PWA using only Node.js built-ins (no dependencies).
// Run: node scripts/generate-icons.js
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0);
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

function createIconPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB

  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(size * rowSize);

  const cx = size / 2, cy = size / 2;
  const diamondR = size * 0.42;   // outer diamond radius
  const innerR   = size * 0.20;   // inner cutout radius (hollow center)
  const padding  = size * 0.06;

  // Colors
  const bg     = [15, 10, 30];    // #0f0a1e — very dark
  const purple = [124, 58, 237];  // #7c3aed
  const light  = [196, 181, 253]; // #c4b5fd — lighter inner

  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0; // PNG filter: None
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - cx) / (diamondR - padding);
      const dy = Math.abs(y - cy) / (diamondR - padding);
      const dxI = Math.abs(x - cx) / innerR;
      const dyI = Math.abs(y - cy) / innerR;

      const inOuter = dx + dy <= 1.0;
      const inInner = dxI + dyI <= 1.0;

      let color;
      if (inInner) {
        color = light;
      } else if (inOuter) {
        color = purple;
      } else {
        color = bg;
      }

      const off = y * rowSize + 1 + x * 3;
      raw[off] = color[0];
      raw[off + 1] = color[1];
      raw[off + 2] = color[2];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

const publicDir = path.join(__dirname, "..", "public");
fs.mkdirSync(publicDir, { recursive: true });

for (const size of [192, 512]) {
  const file = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(file, createIconPNG(size));
  console.log(`Generated ${file}`);
}

console.log("Done.");
