import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATS_FILE = path.join(__dirname, 'unstop-stats.json');
const UNSTOP_API_URL = 'https://unstop.com/api/public/competition/1729660';

async function syncUnstopStats() {
  try {
    const res = await fetch(UNSTOP_API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const comp = json?.data?.competition;
    if (comp && typeof comp.registerCount === 'number') {
      const stats = {
        competitionId: 1729660,
        title: comp.title || 'Innovation Hacks Global AI Hackathon 2026',
        registerCount: comp.registerCount,
        viewsCount: comp.viewsCount || 0,
        status: comp.status || 'FINISHED',
        organisation: comp.organisation?.name || 'Innovation Hacks',
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
      console.log(`[${new Date().toLocaleTimeString()}] Synced Unstop live participants: ${comp.registerCount} (views: ${comp.viewsCount})`);
      return stats;
    }
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Error syncing Unstop stats:`, err.message);
  }
  return null;
}

// Initial sync immediately
syncUnstopStats();

// Keep syncing every 45 seconds
setInterval(syncUnstopStats, 45000);
