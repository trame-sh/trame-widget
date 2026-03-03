import type {
  FeedbackPayload,
  FeedbackResponse,
  TrameWidgetConfig,
} from './types.js';
import { WidgetError } from './types.js';

/**
 * HTTP client for feedback API
 */
export class FeedbackAPI {
  private readonly apiEndpoint: string;
  private readonly apiKey: string;

  constructor(config: TrameWidgetConfig) {
    this.apiKey = config.apiKey;
    
    // Default to production API or derive from current origin
    if (config.apiEndpoint) {
      this.apiEndpoint = config.apiEndpoint;
    } else if (typeof window !== 'undefined') {
      // Try to derive from current page (for development)
      const origin = window.location.origin;
      this.apiEndpoint = origin.includes('localhost') || origin.includes('127.0.0.1')
        ? `${origin}/api/feedback`
        : 'https://api.trame.dev/api/feedback';
    } else {
      this.apiEndpoint = 'https://api.trame.dev/api/feedback';
    }
  }

  /**
   * Submit feedback to the API
   */
  async submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new WidgetError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || 'API_ERROR',
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof WidgetError) {
        throw error;
      }

      // Network or other errors
      throw new WidgetError(
        error instanceof Error ? error.message : 'Network error',
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Validate configuration
   */
  static validateConfig(config: Partial<TrameWidgetConfig>): void {
    if (!config.projectId) {
      throw new WidgetError('projectId is required', 'INVALID_CONFIG');
    }
    if (!config.apiKey) {
      throw new WidgetError('apiKey is required', 'INVALID_CONFIG');
    }
    if (!config.apiKey.startsWith('tk_pub_')) {
      throw new WidgetError('apiKey must start with "tk_pub_"', 'INVALID_CONFIG');
    }
  }
}
