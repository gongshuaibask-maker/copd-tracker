// Product Hunt 封面图生成器 (1270×760)
// 用法: node scripts/generate-ph-cover.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const W = 1270;
const H = 760;
const outPath = path.join(__dirname, '..', 'landing', 'ph-cover.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1B5E20"/>
      <stop offset="40%" stop-color="#2E7D32"/>
      <stop offset="100%" stop-color="#43A047"/>
    </linearGradient>
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2E7D32"/>
      <stop offset="100%" stop-color="#43A047"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="200" cy="150" r="180" fill="rgba(255,255,255,0.03)"/>
  <circle cx="900" cy="600" r="250" fill="rgba(255,255,255,0.03)"/>
  <circle cx="1100" cy="100" r="120" fill="rgba(255,255,255,0.04)"/>
  <circle cx="100" cy="650" r="100" fill="rgba(255,255,255,0.02)"/>
  <g filter="url(#shadow)" transform="translate(110, 160)">
    <rect width="180" height="180" rx="36" fill="url(#iconBg)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <ellipse cx="65" cy="100" rx="32" ry="48" fill="rgba(255,255,255,0.9)" transform="rotate(-8,65,100)"/>
    <ellipse cx="115" cy="100" rx="32" ry="48" fill="rgba(255,255,255,0.9)" transform="rotate(8,115,100)"/>
    <polyline points="25,142 52,142 62,125 78,152 88,128 104,158 114,142 155,142" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <rect x="320" y="140" rx="16" ry="16" width="125" height="36" fill="rgba(255,255,255,0.15)"/>
  <text x="382" y="163" text-anchor="middle" fill="#fff" font-size="15" font-family="-apple-system, sans-serif">📱 iOS + Android</text>
  <rect x="455" y="140" rx="16" ry="16" width="100" height="36" fill="rgba(255,255,255,0.15)"/>
  <text x="505" y="163" text-anchor="middle" fill="#fff" font-size="15" font-family="-apple-system, sans-serif">🆓 Free</text>
  <rect x="565" y="140" rx="16" ry="16" width="135" height="36" fill="rgba(255,255,255,0.15)"/>
  <text x="632" y="163" text-anchor="middle" fill="#fff" font-size="15" font-family="-apple-system, sans-serif">🔒 Privacy First</text>
  <text x="340" y="235" fill="#fff" font-size="52" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, sans-serif" letter-spacing="-0.5">COPD Self-Management</text>
  <text x="340" y="300" fill="#fff" font-size="52" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, sans-serif" letter-spacing="-0.5">Assistant</text>
  <text x="340" y="355" fill="#C8E6C9" font-size="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif">11 Tracking Modules · 100% Local Storage · Free &amp; Open Source</text>
  <g transform="translate(340, 400)">
    <rect x="0" y="0" rx="8" ry="8" width="290" height="44" fill="rgba(255,255,255,0.12)"/>
    <text x="16" y="28" fill="#fff" font-size="18" font-family="-apple-system, sans-serif">🫁  Pulmonary Function</text>
    <rect x="0" y="54" rx="8" ry="8" width="290" height="44" fill="rgba(255,255,255,0.12)"/>
    <text x="16" y="82" fill="#fff" font-size="18" font-family="-apple-system, sans-serif">💓  Daily Vitals &amp; SpO₂</text>
    <rect x="0" y="108" rx="8" ry="8" width="290" height="44" fill="rgba(255,255,255,0.12)"/>
    <text x="16" y="136" fill="#fff" font-size="18" font-family="-apple-system, sans-serif">📋  Symptom Scoring (CAT+mMRC)</text>
  </g>
  <g transform="translate(670, 400)">
    <rect x="0" y="0" rx="8" ry="8" width="280" height="44" fill="rgba(255,255,255,0.12)"/>
    <text x="16" y="28" fill="#fff" font-size="18" font-family="-apple-system, sans-serif">📊  Auto-generated Trend Charts</text>
    <rect x="0" y="54" rx="8" ry="8" width="280" height="44" fill="rgba(255,255,255,0.12)"/>
    <text x="16" y="82" fill="#fff" font-size="18" font-family="-apple-system, sans-serif">🤖  OCR Report Recognition</text>
    <rect x="0" y="108" rx="8" ry="8" width="280" height="44" fill="rgba(255,255,255,0.12)"/>
    <text x="16" y="136" fill="#fff" font-size="18" font-family="-apple-system, sans-serif">🔔  Smart Reminders</text>
  </g>
  <rect x="0" y="${H - 60}" width="${W}" height="60" fill="rgba(0,0,0,0.15)"/>
  <text x="${W/2}" y="${H - 28}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="16" font-family="-apple-system, sans-serif">iOS + Android · React Native · TypeScript · SQLite · Open Source</text>
</svg>`;

async function main() {
  try {
    await sharp(Buffer.from(svg)).resize(W, H).png().toFile(outPath);
    console.log(`✅ PH cover image saved to: ${outPath}`);
    console.log(`   Size: ${W}×${H}px`);
  } catch (err) {
    console.error('Error:', err.message);
    const htmlPath = path.join(__dirname, '..', 'landing', 'ph-cover.html');
    fs.writeFileSync(htmlPath, `<html><body style="margin:0">${svg}</body></html>`);
    console.log(`✅ PH cover HTML saved to: ${htmlPath}`);
  }
}
main();
