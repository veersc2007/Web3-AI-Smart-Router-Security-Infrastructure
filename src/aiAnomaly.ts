import { zScore } from 'simple-statistics';

export interface ThreatAnalysis {
  isAnomalous: boolean;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0 to 100
  reasons: string[];
}

export class AIAnomalyDetector {
  private payloadSizes: number[] = [];
  private readonly windowSize = 50;

  // Known dangerous function selectors
  private readonly DANGEROUS_SELECTORS: Record<string, string> = {
    '0xa9059cbb': 'ERC20 transfer',
    '0x095ea7b3': 'ERC20 approve (Potential Unlimited Approval)',
    '0xa22cb465': 'ERC721 setApprovalForAll (High Risk NFT Drainer Pattern)',
    '0xd50514c5': 'ERC20 permit (Signature Approval)',
  };

  /**
   * Analyze incoming JSON-RPC payload for anomalies and security threats.
   */
  public analyzeRequest(payload: any): ThreatAnalysis {
    const reasons: string[] = [];
    let riskScore = 0;

    const jsonStr = JSON.stringify(payload);
    const byteSize = Buffer.byteLength(jsonStr, 'utf8');

    // 1. Statistical Payload Size Anomaly Detection (Z-Score)
    if (this.payloadSizes.length >= 10) {
      const sizeZ = zScore(byteSize, this.getMean(this.payloadSizes), this.getStdDev(this.payloadSizes));
      if (sizeZ > 2.5) {
        reasons.push(`Anomalous payload size detected (${byteSize} bytes, Z-Score: ${sizeZ.toFixed(2)})`);
        riskScore += 35;
      }
    }

    // Maintain sliding window of payload sizes
    this.payloadSizes.push(byteSize);
    if (this.payloadSizes.length > this.windowSize) {
      this.payloadSizes.shift();
    }

    // 2. Transaction Payload Inspection
    if (payload.method === 'eth_sendRawTransaction' && Array.isArray(payload.params) && payload.params[0]) {
      const rawTx = String(payload.params[0]).toLowerCase();

      // Check for known phishing/drainer selectors in raw calldata
      for (const [selector, description] of Object.entries(this.DANGEROUS_SELECTORS)) {
        if (rawTx.includes(selector.substring(2))) {
          reasons.push(`Detected sensitive function signature: ${description}`);
          riskScore += 40;
        }
      }

      // Check for raw transaction length anomalies
      if (rawTx.length < 50) {
        reasons.push('Malformed raw transaction string (under minimum length)');
        riskScore += 50;
      }
    }

    // 3. Rate & Method Frequency Rules
    if (payload.method === 'eth_accounts' || payload.method === 'eth_requestAccounts') {
      reasons.push('Account enumeration probe detected');
      riskScore += 15;
    }

    // Determine Threat Level
    let threatLevel: ThreatAnalysis['threatLevel'] = 'LOW';
    if (riskScore >= 70) threatLevel = 'CRITICAL';
    else if (riskScore >= 45) threatLevel = 'HIGH';
    else if (riskScore >= 20) threatLevel = 'MEDIUM';

    return {
      isAnomalous: riskScore >= 35,
      threatLevel,
      riskScore: Math.min(riskScore, 100),
      reasons: reasons.length > 0 ? reasons : ['Payload within normal statistical parameters.']
    };
  }

  private getMean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private getStdDev(data: number[]): number {
    const mean = this.getMean(data);
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    return Math.sqrt(variance) || 1;
  }
}