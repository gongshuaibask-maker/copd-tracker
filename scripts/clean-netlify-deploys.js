// 清理 Netlify 旧部署 — 保留最新一条
// 直接调用 Netlify REST API，避免 CLI 参数转义问题
const https = require('https');

const SITE_ID = '3df6f3eb-e0c4-4dc7-9e87-1ae1200e2d7d';

function apiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.netlify.com',
      path: `/api/v1${path}`,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(body); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  // 获取部署列表
  const deploys = await apiCall('GET', `/sites/${SITE_ID}/deploys?per_page=100`);
  console.log(`Found ${deploys.length} deploys`);

  // 按创建时间排序，保留最新一条
  deploys.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const toDelete = deploys.slice(1);

  console.log(`Keeping latest: ${deploys[0]?.id} (${deploys[0]?.created_at})`);
  console.log(`Deleting ${toDelete.length} old deploys...`);

  for (const deploy of toDelete) {
    try {
      await apiCall('DELETE', `/deploys/${deploy.id}`);
      console.log(`  ✓ Deleted: ${deploy.id} (${deploy.created_at})`);
    } catch (e) {
      console.error(`  ✗ Failed: ${deploy.id} - ${e.message}`);
    }
  }
  console.log('Done!');
}

main().catch(console.error);
