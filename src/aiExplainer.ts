import { GoogleGenAI } from '@google/genai';

export class LLMTxExplainer {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 10) {
      this.ai = new GoogleGenAI({ apiKey });
      console.log('🤖 [GEMINI AI]: Client successfully connected.');
    } else {
      console.log('⚠️ [GEMINI AI]: GEMINI_API_KEY is missing or empty in .env');
    }
  }

  public async explainTransaction(rawTxHex: string, targetAddress?: string): Promise<string> {
    if (!this.ai) {
      return `ℹ️ [Heuristic Summary]: Raw Transaction payload intercepted (${rawTxHex.substring(0, 18)}...). Set GEMINI_API_KEY in .env for full AI natural language analysis.`;
    }

    const prompt = `
      You are an EVM Security Specialist.
      Analyze this raw EVM transaction call payload:
      Target Address: ${targetAddress || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'}
      Raw Tx Hex / Calldata Snippet: ${rawTxHex}

      Provide a 2-sentence plain English breakdown:
      1. Explain what function/intent is being executed.
      2. Give a security assessment (Is it safe or a risky approval/drainer pattern?).
    `;

    // High-capacity & active production models
    const candidateModels = [
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.0-flash'
    ];

    for (const modelName of candidateModels) {
      try {
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        // Skip onto next model candidate if 404/429 occurs
        continue;
      }
    }

    return `⚠️ [AI Fallback]: Raw Tx parameter detected. Hex signature: ${rawTxHex.substring(0, 20)}...`;
  }
}