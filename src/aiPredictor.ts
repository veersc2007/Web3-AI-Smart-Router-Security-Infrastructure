export interface NodePrediction {
  url: string;
  observedLatencyMs: number;
  predictedLatencyMs: number;
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADED';
}

export class EWMALatencyPredictor {
  private alpha: number; // Smoothing factor (0.35 gives strong weight to recent latency spikes)
  private predictions: Record<string, number> = {};

  constructor(alpha: number = 0.35) {
    this.alpha = alpha;
  }

  /**
   * Updates predicted latency for a node using Exponentially Weighted Moving Average.
   */
  public updateAndPredict(url: string, observedLatencyMs: number): NodePrediction {
    const previousPrediction = this.predictions[url] ?? observedLatencyMs;
    
    // EWMA Formula calculation
    const predictedLatency = Math.round(
      this.alpha * observedLatencyMs + (1 - this.alpha) * previousPrediction
    );

    this.predictions[url] = predictedLatency;

    // Determine latency trend trajectory
    let trend: NodePrediction['trend'] = 'STABLE';
    const delta = observedLatencyMs - previousPrediction;

    if (delta > 40) {
      trend = 'DEGRADED';
    } else if (delta < -20) {
      trend = 'IMPROVING';
    }

    return {
      url,
      observedLatencyMs,
      predictedLatencyMs: predictedLatency,
      trend
    };
  }

  /**
   * Retrieves the predicted latency for a specific node.
   */
  public getPredictedLatency(url: string, defaultLatency: number = 200): number {
    return this.predictions[url] ?? defaultLatency;
  }
}