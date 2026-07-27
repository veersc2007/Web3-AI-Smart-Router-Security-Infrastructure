// test-resilience.js
import fetch from 'node-fetch';

const ROUTER_URL = 'http://localhost:3000';

async function simulateTraffic() {
  console.log("⚡ Starting 50-Request Traffic Blast through Smart Router...");

  for (let i = 1; i <= 50; i++) {
    try {
      const start = Date.now();
      const res = await fetch(ROUTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: i
        })
      });
      
      const data = await res.json();
      const duration = Date.now() - start;

      console.log(`[Req #${i}] Status: ${res.status} | Block: ${data.result || 'ERR'} | Time: ${duration}ms`);
    } catch (err) {
      console.error(`[Req #${i}] FAILED:`, err.message);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 100));
  }
}

simulateTraffic();