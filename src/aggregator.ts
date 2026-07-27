import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import rateLimit from 'express-rate-limit';
import path from 'path';

import { AIAnomalyDetector } from './aiAnomaly';
import { EWMALatencyPredictor } from './aiPredictor';
import { LLMTxExplainer } from './aiExplainer';

const aiExplainer = new LLMTxExplainer();
const aiPredictor = new EWMALatencyPredictor(0.35);
const aiShield = new AIAnomalyDetector();

const app = express();
app.use(express.json());

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Rate Limiter: Max 120 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: {
    jsonrpc: '2.0',
    id: 1,
    error: { code: -32005, message: 'Rate limit exceeded. Please slow down.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter globally across all routes
app.use(apiLimiter);

// -------------------------------------------------------------
// 🌐 RPC PROVIDERS CONFIGURATION
// -------------------------------------------------------------
const READ_PROVIDERS = Object.keys(process.env)
  .filter(key => key.startsWith('SEPOLIA_RPC_'))
  .map(key => process.env[key] as string)
  .filter(Boolean);

// Default fallback endpoints if environment keys are missing
if (READ_PROVIDERS.length === 0) {
  READ_PROVIDERS.push(
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://sepolia.drpc.org',
    'https://rpc.ankr.com/eth_sepolia'
  );
}

const WRITE_PROVIDER = process.env.PROTECTED_WRITE_RPC || 'https://ethereum-sepolia-rpc.publicnode.com';

interface NodeHealth {
  url: string;
  totalHits: number;
  successHits: number;
  consecutiveFailures: number;
  avgLatencyMs: number;
  lastBlockNumber: number;
  status: 'HEALTHY' | 'STALE' | 'CIRCUIT_OPEN' | 'OFFLINE';
  circuitResetTime?: number;
}

const NODE_REGISTRY: Record<string, NodeHealth> = {};

READ_PROVIDERS.concat(WRITE_PROVIDER).forEach(url => {
  if (!NODE_REGISTRY[url]) {
    NODE_REGISTRY[url] = {
      url,
      totalHits: 0,
      successHits: 0,
      consecutiveFailures: 0,
      avgLatencyMs: 0,
      lastBlockNumber: 0,
      status: 'HEALTHY'
    };
  }
});

const METRICS = {
  totalRequests: 0,
  readRequests: 0,
  writeRequestsProtected: 0,
  consensusFailures: 0,
  optimizationSavedRequests: 0
};

// Global container to hold the latest AI Threat analysis state for telemetry
let lastThreatReport: any = {
  threatLevel: 'LOW',
  riskScore: 0,
  reasons: ['System nominal. Monitoring active.']
};

interface RPCResponse {
  provider: string;
  data: any;
  latencyMs: number;
  status: 'SUCCESS' | 'FAILED';
}

async function fetchFromProvider(url: string, payload: any): Promise<RPCResponse> {
  const start = Date.now();
  const node = NODE_REGISTRY[url];

  // Circuit Breaker Check: Skip nodes in CIRCUIT_OPEN state for 30s
  if (node.status === 'CIRCUIT_OPEN') {
    if (Date.now() > (node.circuitResetTime || 0)) {
      console.log(`🔌 [CIRCUIT BREAKER]: Half-open probe for ${url}`);
    } else {
      return { provider: url, data: null, latencyMs: 0, status: 'FAILED' };
    }
  }

  node.totalHits += 1;

  try {
    const response = await axios.post(url, payload, {
      timeout: 4000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const latency = Date.now() - start;

    // Feed observation into EWMA Latency Predictor
    const prediction = aiPredictor.updateAndPredict(url, latency);
    node.avgLatencyMs = prediction.predictedLatencyMs;

    if (response.data && (response.data.result !== undefined || response.data.error !== undefined)) {
      node.successHits += 1;
      node.consecutiveFailures = 0;
      if (node.status === 'OFFLINE' || node.status === 'CIRCUIT_OPEN') node.status = 'HEALTHY';
      return { provider: url, data: response.data, latencyMs: latency, status: 'SUCCESS' };
    }
    
    handleNodeFailure(node);
    return { provider: url, data: null, latencyMs: latency, status: 'FAILED' };
  } catch (error: any) {
    const latency = Date.now() - start;
    const prediction = aiPredictor.updateAndPredict(url, latency);
    node.avgLatencyMs = prediction.predictedLatencyMs;

    if (error.response && error.response.data && error.response.data.error) {
      node.successHits += 1;
      node.consecutiveFailures = 0;
      if (node.status === 'OFFLINE' || node.status === 'CIRCUIT_OPEN') node.status = 'HEALTHY';
      return { provider: url, data: error.response.data, latencyMs: latency, status: 'SUCCESS' };
    }
    handleNodeFailure(node);
    return { provider: url, data: null, latencyMs: latency, status: 'FAILED' };
  }
}

function handleNodeFailure(node: NodeHealth) {
  node.consecutiveFailures += 1;
  if (node.consecutiveFailures >= 3 && node.status !== 'CIRCUIT_OPEN') {
    console.log(`⚡ [CIRCUIT BREAKER TRIPPED]: ${node.url} failed 3 consecutive queries. Isolating for 30s.`);
    node.status = 'CIRCUIT_OPEN';
    node.circuitResetTime = Date.now() + 30000;
  } else if (node.status !== 'CIRCUIT_OPEN') {
    node.status = 'OFFLINE';
  }
}

function getRankedReadNodes(): string[] {
  return READ_PROVIDERS
    .map(url => NODE_REGISTRY[url])
    .filter(node => node.status !== 'OFFLINE' && node.status !== 'CIRCUIT_OPEN')
    .sort((a, b) => {
      if (a.status === 'HEALTHY' && b.status === 'STALE') return -1;
      if (a.status === 'STALE' && b.status === 'HEALTHY') return 1;
      
      // AI EWMA Sorting: Query predicted fastest endpoints first
      const predA = aiPredictor.getPredictedLatency(a.url, a.avgLatencyMs);
      const predB = aiPredictor.getPredictedLatency(b.url, b.avgLatencyMs);
      return predA - predB;
    })
    .map(node => node.url);
}

function evaluateBlockStaleness(results: RPCResponse[]) {
  let maxBlockHex = '0x0';

  results.forEach(res => {
    if (res.status === 'SUCCESS' && res.data && res.data.result) {
      const blockHex = res.data.result;
      if (typeof blockHex === 'string' && blockHex.startsWith('0x')) {
        const blockNum = parseInt(blockHex, 16);
        NODE_REGISTRY[res.provider].lastBlockNumber = blockNum;
        if (blockNum > parseInt(maxBlockHex, 16)) {
          maxBlockHex = blockHex;
        }
      }
    }
  });

  const latestBlockNum = parseInt(maxBlockHex, 16);
  if (latestBlockNum > 0) {
    READ_PROVIDERS.forEach(url => {
      const node = NODE_REGISTRY[url];
      if (node.lastBlockNumber > 0 && latestBlockNum - node.lastBlockNumber > 2) {
        if (node.status === 'HEALTHY') {
          console.log(`⚠️ [QUARANTINE]: ${url} lagging by ${latestBlockNum - node.lastBlockNumber} blocks. Flagged STALE.`);
          node.status = 'STALE';
        }
      } else if (node.status === 'STALE' && latestBlockNum - node.lastBlockNumber <= 2) {
        console.log(`✅ [QUARANTINE LIFTED]: ${url} caught up. Status set to HEALTHY.`);
        node.status = 'HEALTHY';
      }
    });
  }
}

// -------------------------------------------------------------
// 📊 METRICS & TELEMETRY
// -------------------------------------------------------------
app.get('/metrics', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    summary: {
      totalRequests: METRICS.totalRequests,
      readRequests: METRICS.readRequests,
      writeRequestsProtected: METRICS.writeRequestsProtected,
      consensusFailures: METRICS.consensusFailures,
      optimizationSavedRequests: METRICS.optimizationSavedRequests
    },
    nodePerformance: NODE_REGISTRY,
    lastAiShieldReport: lastThreatReport
  });
});

// -------------------------------------------------------------
// 🔀 MAIN JSON-RPC ROUTER
// -------------------------------------------------------------
app.post('/', async (req: Request, res: Response) => {
  METRICS.totalRequests += 1;
  const payload = req.body;
  const requestId = payload?.id || 1;
  const method = payload?.method || 'unknown';

  // 1. WRITE ROUTE INTERCEPTION
  if (method === 'eth_sendRawTransaction') {
    METRICS.writeRequestsProtected += 1;
    console.log(`\n--------------------------------------------------`);
    console.log(`🛡️ [WRITE INTERCEPTED]: Method [${method}] -> Private MEV Relay`);

    // 🤖 AI MODULE: LLM INTENT EXPLAINER
    let explanation = "Standard transaction routing through private MEV relay.";
    const rawTxHex = Array.isArray(payload.params) ? payload.params[0] : '';
    if (rawTxHex) {
      console.log(`🔍 [AI EXPLAINER]: Querying Gemini for transaction intent...`);
      explanation = await aiExplainer.explainTransaction(String(rawTxHex));
      console.log(`🤖 [AI INTENT BREAKDOWN]:\n${explanation}`);
    }

    // 🤖 AI MODULE: ANOMALY & FRAUD SHIELD
    const threatReport = aiShield.analyzeRequest(payload);
    lastThreatReport = threatReport;
    
    console.log(`\n🛡️ [AI SHIELD STATUS]: Risk Score: ${threatReport.riskScore}/100 | Threat Level: ${threatReport.threatLevel}`);
    threatReport.reasons.forEach(r => console.log(`  └─ ⚠️ ${r}`));

    // BLOCK ONLY CRITICAL RISKS
    if (threatReport.threatLevel === 'CRITICAL') {
      console.log(`🚨 [BLOCKED]: Transaction blocked by AI Shield policy.`);
      console.log(`--------------------------------------------------\n`);
      return res.status(403).json({
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32003,
          message: 'AI Shield: Transaction blocked due to critical risk detection.',
          details: threatReport
        },
        aiAnalysis: explanation
      });
    }

    // FORWARD CLEAN WRITES TO PROTECTED PROVIDER
    const writeResult = await fetchFromProvider(WRITE_PROVIDER, payload);
    console.log(`--------------------------------------------------\n`);

    if (writeResult.status === 'SUCCESS') {
      return res.json({
        ...writeResult.data,
        aiAnalysis: explanation
      });
    } else {
      return res.status(502).json({
        jsonrpc: '2.0',
        id: requestId,
        error: { code: -32000, message: 'Private routing error.' },
        aiAnalysis: explanation
      });
    }
  }

  // 2. READ ROUTE INTERCEPTION
  METRICS.readRequests += 1;

  // Run AI Shield on Read Requests
  const threatReport = aiShield.analyzeRequest(payload);
  lastThreatReport = threatReport;

  if (threatReport.isAnomalous) {
    console.log(`\n⚠️ [READ ANOMALY]: Risk Score ${threatReport.riskScore}/100`);
    threatReport.reasons.forEach(r => console.log(`  └─ ⚠️ ${r}`));
  }

  let rankedNodes = getRankedReadNodes();
  if (rankedNodes.length === 0) rankedNodes = READ_PROVIDERS;

  const primaryNodes = rankedNodes.slice(0, 2);
  const fallbackNodes = rankedNodes.slice(2);

  console.log(`⚡ [READ INTERCEPTED]: Method [${method}] -> Querying Top Nodes`);

  let results = await Promise.all(primaryNodes.map(url => fetchFromProvider(url, payload)));

  let frequencyMap: Record<string, { count: number; responseData: any }> = {};
  results.forEach(res => {
    if (res.status === 'SUCCESS' && res.data) {
      const key = JSON.stringify(res.data.result || res.data.error);
      frequencyMap[key] = { count: (frequencyMap[key]?.count || 0) + 1, responseData: res.data };
    }
  });

  let bestResponse = null;
  let maxVotes = 0;
  for (const item of Object.values(frequencyMap)) {
    if (item.count > maxVotes) {
      maxVotes = item.count;
      bestResponse = item.responseData;
    }
  }

  // Fallback trigger if primary node queries fail consensus
  if (!bestResponse) {
    if (fallbackNodes.length > 0) {
      console.log(`  └─ ⚠️ Fallback triggered across remaining ${fallbackNodes.length} nodes...`);
      const fallbackResults = await Promise.all(fallbackNodes.map(url => fetchFromProvider(url, payload)));
      results = results.concat(fallbackResults);

      frequencyMap = {};
      results.forEach(res => {
        if (res.status === 'SUCCESS' && res.data) {
          const key = JSON.stringify(res.data.result || res.data.error);
          frequencyMap[key] = { count: (frequencyMap[key]?.count || 0) + 1, responseData: res.data };
        }
      });

      for (const item of Object.values(frequencyMap)) {
        if (item.count > maxVotes) {
          maxVotes = item.count;
          bestResponse = item.responseData;
        }
      }
    }
  } else {
    METRICS.optimizationSavedRequests += fallbackNodes.length;
  }

  if (method === 'eth_blockNumber') {
    evaluateBlockStaleness(results);
  }

  if (bestResponse) {
    return res.json(bestResponse);
  } else {
    METRICS.consensusFailures += 1;
    return res.status(500).json({
      jsonrpc: '2.0',
      id: requestId,
      error: { code: -32603, message: 'Consensus failed across all nodes.' }
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Web3 Smart Router live at: http://localhost:${PORT}`);
  console.log(`📊 Live Telemetry Dashboard at: http://localhost:${PORT}\n`);
});