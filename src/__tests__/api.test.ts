import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeedbackAPI } from '../api.js';
import { WidgetError } from '../types.js';
import type { TrameWidgetConfig, FeedbackPayload } from '../types.js';

describe('FeedbackAPI', () => {
  const mockConfig: TrameWidgetConfig = {
    projectId: 'proj_test123',
    apiKey: 'tk_pub_test1234567890abcdef',
  };

  beforeEach(() => {
    // Reset fetch mock
    vi.unstubAllGlobals();
  });

  describe('validateConfig', () => {
    it('should throw if projectId is missing', () => {
      expect(() => {
        FeedbackAPI.validateConfig({ apiKey: 'tk_pub_test' });
      }).toThrow(WidgetError);
    });

    it('should throw if apiKey is missing', () => {
      expect(() => {
        FeedbackAPI.validateConfig({ projectId: 'proj_123' });
      }).toThrow(WidgetError);
    });

    it('should throw if apiKey does not start with tk_pub_', () => {
      expect(() => {
        FeedbackAPI.validateConfig({
          projectId: 'proj_123',
          apiKey: 'invalid_key',
        });
      }).toThrow(WidgetError);
    });

    it('should not throw for valid config', () => {
      expect(() => {
        FeedbackAPI.validateConfig({
          projectId: 'proj_123',
          apiKey: 'tk_pub_validkey',
        });
      }).not.toThrow();
    });
  });

  describe('constructor', () => {
    it('should use custom apiEndpoint if provided', () => {
      const config = {
        ...mockConfig,
        apiEndpoint: 'https://custom.api.com/feedback',
      };
      const api = new FeedbackAPI(config);
      expect(api).toBeDefined();
    });

    it('should derive endpoint from window.location in development', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true,
      });

      const api = new FeedbackAPI(mockConfig);
      expect(api).toBeDefined();
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const mockResponse = {
        id: 'feedback_123',
        created_at: '2026-02-11T10:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const api = new FeedbackAPI(mockConfig);
      const payload: FeedbackPayload = {
        project_id: mockConfig.projectId,
        message: 'Test feedback',
        source_url: 'https://example.com',
      };

      const result = await api.submitFeedback(payload);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': mockConfig.apiKey,
          },
          body: JSON.stringify(payload),
        })
      );
    });

    it('should throw WidgetError on API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Invalid payload',
          code: 'INVALID_PAYLOAD',
        }),
      });

      const api = new FeedbackAPI(mockConfig);
      const payload: FeedbackPayload = {
        project_id: mockConfig.projectId,
        message: '',
      };

      await expect(api.submitFeedback(payload)).rejects.toThrow(WidgetError);
    });

    it('should handle 401 unauthorized error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          message: 'Invalid API key',
          code: 'UNAUTHORIZED',
        }),
      });

      const api = new FeedbackAPI(mockConfig);
      const payload: FeedbackPayload = {
        project_id: mockConfig.projectId,
        message: 'Test',
      };

      await expect(api.submitFeedback(payload)).rejects.toThrow(WidgetError);
    });

    it('should handle 429 rate limit error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT',
        }),
      });

      const api = new FeedbackAPI(mockConfig);
      const payload: FeedbackPayload = {
        project_id: mockConfig.projectId,
        message: 'Test',
      };

      await expect(api.submitFeedback(payload)).rejects.toThrow(WidgetError);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const api = new FeedbackAPI(mockConfig);
      const payload: FeedbackPayload = {
        project_id: mockConfig.projectId,
        message: 'Test',
      };

      await expect(api.submitFeedback(payload)).rejects.toThrow(WidgetError);
    });

    it('should handle non-JSON error responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      const api = new FeedbackAPI(mockConfig);
      const payload: FeedbackPayload = {
        project_id: mockConfig.projectId,
        message: 'Test',
      };

      await expect(api.submitFeedback(payload)).rejects.toThrow(WidgetError);
    });
  });
});
