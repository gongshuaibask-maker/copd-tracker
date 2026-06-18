/**
 * GitHub Pages 部署辅助脚本
 * 
 * 将 landing/ 和 privacy/ 中的内容整理到 deploy/ 目录
 * 可直接部署到 GitHub Pages
 * 
 * 用法: node scripts/deploy-gh-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEPLOY = path.join(ROOT, 'docs-website');

// 文件映射: [源路径, 目标路径]
const FILES = [
  // 英文着陆页（主页面）
  ['landing/en/index.html', 'index.html'],
  // 中文着陆页
  ['landing/index.html', 'zh/index.html'],
  // App 图标
  ['landing/icon-240.png', 'icon-240.png'],
  ['assets/images/icon-192.png', 'icon-192.png'],
  // PH 封面图
  ['landing/ph-cover.png', 'ph-cover.png'],
  // OG 图片生成器
  ['landing/og-image-generator.html', 'og-image-generator.html'],
  // 隐私政策
  ['privacy/index.html', 'privacy-policy/index.html'],
  // 技术支持
  ['landing/support/index.html', 'support/index.html'],
];

function copyFile(src, dest) {
  const srcPath = path.join(ROOT, src);
  const destPath = path.join(DEPLOY, dest);
  
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠️  源文件不存在: ${src}`);
    return false;
  }
  
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  console.log(`  ✅ ${dest}`);
  return true;
}

function main() {
  console.log('🌐 GitHub Pages 部署文件生成\n');
  
  // 复制文件（覆盖已存在的）
  let count = 0;
  for (const [src, dest] of FILES) {
    if (copyFile(src, dest)) count++;
  }
  
  // 创建 CNAME 文件（可选）
  // fs.writeFileSync(path.join(DEPLOY, 'CNAME'), 'copd-tracker.app');
  
  console.log(`\n✅ 共复制 ${count} 个文件到 docs-website/`);
  console.log(`\n📌 部署方式:`);
  console.log(`  1. 将 docs-website/ 目录内容推送到 GitHub Pages 仓库`);
  console.log(`  2. 或使用 Netlify: 直接拖拽 docs-website/ 目录到 netlify.com`);
}

main();
