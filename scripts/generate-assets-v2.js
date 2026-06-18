/**
 * COPD App — 全量图标 & 启动屏生成脚本
 *
 * 使用 sharp 生成各平台所需尺寸的图标和启动屏图片。
 * 图标设计：绿色渐变圆角方形背景 + 白色双肺 SVG + 十字标记
 *
 * 用法: node scripts/generate-assets-v2.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'assets', 'images');
const PRIMARY = '#2E7D32';
const PRIMARY_LIGHT = '#43A047';
const WHITE = '#FFFFFF';

// ============ SVG 图标定义 ============
function iconSVG(size) {
  const r = Math.round(size * 0.21875); // 圆角半径
  const pad = Math.round(size * 0.0625);
  const inner = size - pad * 2;
  const lungScale = size / 1024;

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
    <!-- 圆角背景 -->
    <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="url(#bg)"/>
    <!-- 左肺 -->
    <g transform="translate(${size * 0.33}, ${size * 0.25}) scale(${lungScale * 0.001})">
      <path d="M0,280 C0,280 -30,200 10,140 C30,110 50,80 70,40 C80,20 100,10 110,0 C120,10 140,20 150,40 C170,80 190,110 210,140 C250,200 220,280 220,280 C220,350 200,420 170,460 C150,485 130,500 110,500 C90,500 70,485 50,460 C20,420 0,350 0,280 Z" fill="url(#lung)" stroke="${WHITE}" stroke-width="${6 * lungScale}" stroke-opacity="0.3"/>
      <path d="M100,0 C100,-40 100,-80 100,-100 C100,-130 90,-150 80,-170" fill="none" stroke="${WHITE}" stroke-width="${20 * lungScale}" stroke-linecap="round" stroke-opacity="0.9"/>
    </g>
    <!-- 右肺 (水平镜像) -->
    <g transform="translate(${size * 0.67}, ${size * 0.25}) scale(${-lungScale * 0.001}, ${lungScale * 0.001})">
      <path d="M0,280 C0,280 -30,200 10,140 C30,110 50,80 70,40 C80,20 100,10 110,0 C120,10 140,20 150,40 C170,80 190,110 210,140 C250,200 220,280 220,280 C220,350 200,420 170,460 C150,485 130,500 110,500 C90,500 70,485 50,460 C20,420 0,350 0,280 Z" fill="url(#lung)" stroke="${WHITE}" stroke-width="${6 * lungScale}" stroke-opacity="0.3"/>
      <path d="M100,0 C100,-40 100,-80 100,-100 C100,-130 90,-150 80,-170" fill="none" stroke="${WHITE}" stroke-width="${20 * lungScale}" stroke-linecap="round" stroke-opacity="0.9"/>
    </g>
    <!-- 气管 -->
    <path d="M${size * 0.49},${size * 0.13} C${size * 0.49},${size * 0.10} ${size * 0.49},${size * 0.08} ${size * 0.49},${size * 0.06} C${size * 0.49},${size * 0.04} ${size * 0.50},${size * 0.035} ${size * 0.51},${size * 0.03}" fill="none" stroke="${WHITE}" stroke-width="${24 * lungScale}" stroke-linecap="round" stroke-opacity="0.9"/>
    <!-- 心电图波纹 -->
    <g transform="translate(${size * 0.38}, ${size * 0.58}) scale(${lungScale})" opacity="0.6">
      <path d="M0,30 L20,30 L35,30 L40,5 L45,55 L50,30 L65,30 L80,30 L85,15 L90,45 L95,30 L110,30 L130,30" fill="none" stroke="${WHITE}" stroke-width="${8}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <!-- 加号 (医疗标记) -->
    <g transform="translate(${size * 0.73}, ${size * 0.64}) scale(${lungScale})">
      <rect x="-16" y="-6" width="32" height="12" rx="3" fill="${WHITE}" opacity="0.5"/>
      <rect x="-6" y="-16" width="12" height="32" rx="3" fill="${WHITE}" opacity="0.5"/>
    </g>
  </svg>`;
}

// ============ SVG 启动屏定义 ============
function splashSVG(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${PRIMARY}"/>
        <stop offset="100%" style="stop-color:#1B5E20"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <!-- 光环 -->
    <circle cx="${w/2}" cy="${h*0.43}" r="${Math.min(w,h)*0.18}" fill="${WHITE}" opacity="0.08"/>
    <circle cx="${w/2}" cy="${h*0.43}" r="${Math.min(w,h)*0.14}" fill="${WHITE}" opacity="0.12"/>
    <!-- 肺图标 -->
    <g transform="translate(${w/2}, ${h*0.43}) scale(${Math.min(w,h)/800})">
      <g transform="translate(-80, -50)">
        <path d="M0,130 C0,130 -20,100 5,70 C15,55 25,40 35,20 C40,10 50,5 55,0 C60,5 70,10 75,20 C85,40 95,55 105,70 C125,100 110,130 110,130 C110,170 100,200 85,220 C75,235 65,240 55,240 C45,240 35,235 25,220 C10,200 0,170 0,130 Z" fill="${WHITE}" opacity="0.9"/>
      </g>
      <g transform="translate(80, -50) scale(-1,1)">
        <path d="M0,130 C0,130 -20,100 5,70 C15,55 25,40 35,20 C40,10 50,5 55,0 C60,5 70,10 75,20 C85,40 95,55 105,70 C125,100 110,130 110,130 C110,170 100,200 85,220 C75,235 65,240 55,240 C45,240 35,235 25,220 C10,200 0,170 0,130 Z" fill="${WHITE}" opacity="0.9"/>
      </g>
      <path d="M0,-90 C0,-100 0,-110 0,-120 C0,-130 -5,-135 -10,-140" fill="none" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
    </g>
    <!-- 标题 -->
    <text x="${w/2}" y="${h*0.58}" text-anchor="middle" fill="${WHITE}" font-size="${Math.round(Math.min(w,h)*0.055)}" font-weight="bold" font-family="sans-serif" opacity="0.95">慢阻肺自我管理助手</text>
    <text x="${w/2}" y="${h*0.62}" text-anchor="middle" fill="#C8E6C9" font-size="${Math.round(Math.min(w,h)*0.028)}" font-family="sans-serif" opacity="0.8">COPD Self-Management</text>
    <!-- 版本号 -->
    <text x="${w/2}" y="${h*0.94}" text-anchor="middle" fill="${WHITE}" font-size="${Math.round(Math.min(w,h)*0.022)}" font-family="sans-serif" opacity="0.4">v1.0.0</text>
  </svg>`;
}

// ============ 生成函数 ============
const ICON_SIZES = [
  { name: 'icon.png', size: 1024, desc: 'App Store 主图标' },
  { name: 'icon-512.png', size: 512, desc: 'Google Play 图标' },
  { name: 'icon-180.png', size: 180, desc: 'iPhone 60pt @3x' },
  { name: 'icon-120.png', size: 120, desc: 'iPhone 60pt @2x' },
  { name: 'icon-96.png', size: 96, desc: 'Android hdpi' },
  { name: 'icon-48.png', size: 48, desc: 'Android mdpi' },
];

const SPLASH_SIZES = [
  { name: 'splash-iphone-6.5.png', width: 1284, height: 2778, desc: 'iPhone 14 Pro Max' },
  { name: 'splash-iphone-5.5.png', width: 1242, height: 2208, desc: 'iPhone 8 Plus' },
  { name: 'splash-android.png', width: 1080, height: 1920, desc: 'Android 手机' },
];

async function generateAll() {
  console.log('🫁 COPD App — 资源生成器\n');

  // 确保输出目录存在
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // === 生成图标 ===
  console.log('📱 生成图标...');
  for (const { name, size, desc } of ICON_SIZES) {
    const svg = iconSVG(size);
    const outPath = path.join(OUT_DIR, name);
    try {
      await sharp(Buffer.from(svg)).png().toFile(outPath);
      console.log(`  ✅ ${name} (${size}×${size}) — ${desc}`);
    } catch (err) {
      console.error(`  ❌ ${name}: ${err.message}`);
    }
  }

  // === 生成启动屏 ===
  console.log('\n🖼️  生成启动屏...');
  for (const { name, width, height, desc } of SPLASH_SIZES) {
    const svg = splashSVG(width, height);
    const outPath = path.join(OUT_DIR, name);
    try {
      await sharp(Buffer.from(svg), { limitInputPixels: false }).png().toFile(outPath);
      console.log(`  ✅ ${name} (${width}×${height}) — ${desc}`);
    } catch (err) {
      console.error(`  ❌ ${name}: ${err.message}`);
    }
  }

  // === 更新 app.json 使用的图标 ===
  // icon.png 已生成到 assets/images/icon.png

  console.log('\n✅ 全部生成完毕！');
  console.log(`\n📌 下一步操作:`);
  console.log(`  1. 将 icon.png (1024×1024) 上传到 App Store Connect`);
  console.log(`  2. 将 splash-iphone-6.5.png 上传到 App Store (截图)`);
  console.log(`  3. 配置 app.json 中的 splash.image 指向正确文件`);
}

generateAll().catch(console.error);
