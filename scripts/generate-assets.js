/**
 * COPD App — Icon & Splash Generator
 * Converts SVG assets to PNG at required sizes using sharp
 * Usage: node scripts/generate-assets.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');

// ============ ICON SIZES ============
const ICON_SIZES = [
  { size: 48,   name: 'icon-48.png' },
  { size: 96,   name: 'icon-96.png' },
  { size: 180,  name: 'icon-180.png' },
  { size: 512,  name: 'icon-512.png' },
  { size: 1024, name: 'icon.png' },       // Main app icon
  { size: 1024, name: 'icon-1024.png' },
];

// ============ SPLASH SIZES ============
const SPLASH_SIZES = [
  { width: 1284, height: 2778, name: 'splash.png' },        // iPhone 14 Pro Max
  { width: 750,  height: 1334, name: 'splash-750x1334.png' }, // iPhone 8
  { width: 1080, height: 1920, name: 'splash-android.png' },  // Android 16:9
];

async function generateIcons() {
  const svgPath = path.join(ASSETS_DIR, 'icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.log('  [SKIP] icon.svg not found');
    return;
  }
  const svgBuffer = fs.readFileSync(svgPath);

  for (const { size, name } of ICON_SIZES) {
    const outPath = path.join(ASSETS_DIR, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`  [OK] ${name} (${size}×${size})`);
  }
}

async function generateSplash() {
  const svgPath = path.join(ASSETS_DIR, 'splash.svg');
  if (!fs.existsSync(svgPath)) {
    console.log('  [SKIP] splash.svg not found');
    return;
  }
  const svgBuffer = fs.readFileSync(svgPath);

  for (const { width, height, name } of SPLASH_SIZES) {
    const outPath = path.join(ASSETS_DIR, name);
    await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toFile(outPath);
    console.log(`  [OK] ${name} (${width}×${height})`);
  }
}

(async function main() {
  console.log('');
  console.log('🫁  COPD App — Asset Generator');
  console.log('================================');
  console.log('');

  console.log('📱 Icons:');
  await generateIcons();

  console.log('');
  console.log('🖥️  Splash Screens:');
  await generateSplash();

  console.log('');
  console.log('✅ All assets generated!');
  console.log('');
})().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
