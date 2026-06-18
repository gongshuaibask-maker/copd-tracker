/**
 * 生成 Landing Page 所需的图标尺寸
 */
const sharp = require('sharp');
const path = require('path');

const PRIMARY = '#2E7D32';
const PRIMARY_LIGHT = '#43A047';
const WHITE = '#FFFFFF';

function svg(size) {
  const r = Math.round(size * 0.21875);
  const pad = Math.round(size * 0.0625);
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${PRIMARY}"/>
        <stop offset="100%" style="stop-color:${PRIMARY_LIGHT}"/>
      </linearGradient>
      <linearGradient id="lung" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${WHITE}"/>
        <stop offset="100%" style="stop-color:#E8F5E9"/>
      </linearGradient>
    </defs>
    <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="url(#bg)"/>
    <g transform="translate(${size*0.33}, ${size*0.25}) scale(${size/1024})">
      <path d="M0,280 C0,280 -30,200 10,140 C30,110 50,80 70,40 C80,20 100,10 110,0 C120,10 140,20 150,40 C170,80 190,110 210,140 C250,200 220,280 220,280 C220,350 200,420 170,460 C150,485 130,500 110,500 C90,500 70,485 50,460 C20,420 0,350 0,280 Z" fill="url(#lung)" stroke="${WHITE}" stroke-width="6" stroke-opacity="0.3"/>
      <path d="M100,0 C100,-40 100,-80 100,-100 C100,-130 90,-150 80,-170" fill="none" stroke="${WHITE}" stroke-width="20" stroke-linecap="round" stroke-opacity="0.9"/>
    </g>
    <g transform="translate(${size*0.67}, ${size*0.25}) scale(${-size/1024}, ${size/1024})">
      <path d="M0,280 C0,280 -30,200 10,140 C30,110 50,80 70,40 C80,20 100,10 110,0 C120,10 140,20 150,40 C170,80 190,110 210,140 C250,200 220,280 220,280 C220,350 200,420 170,460 C150,485 130,500 110,500 C90,500 70,485 50,460 C20,420 0,350 0,280 Z" fill="url(#lung)" stroke="${WHITE}" stroke-width="6" stroke-opacity="0.3"/>
      <path d="M100,0 C100,-40 100,-80 100,-100 C100,-130 90,-150 80,-170" fill="none" stroke="${WHITE}" stroke-width="20" stroke-linecap="round" stroke-opacity="0.9"/>
    </g>
    <path d="M${size*0.49},${size*0.13} C${size*0.49},${size*0.10} ${size*0.49},${size*0.08} ${size*0.49},${size*0.06} C${size*0.49},${size*0.04} ${size*0.50},${size*0.035} ${size*0.51},${size*0.03}" fill="none" stroke="${WHITE}" stroke-width="24" stroke-linecap="round" stroke-opacity="0.9"/>
    <g transform="translate(${size*0.38}, ${size*0.58}) scale(${size/1024})" opacity="0.6">
      <path d="M0,30 L20,30 L35,30 L40,5 L45,55 L50,30 L65,30 L80,30 L85,15 L90,45 L95,30 L110,30 L130,30" fill="none" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`;
}

async function main() {
  const outDir = path.resolve(__dirname, '..', 'assets', 'images');
  for (const size of [240, 192]) {
    const out = path.join(outDir, `icon-${size}.png`);
    await sharp(Buffer.from(svg(size))).png().toFile(out);
    console.log(`✅ icon-${size}.png (${size}x${size})`);
  }
}

main().catch(console.error);
