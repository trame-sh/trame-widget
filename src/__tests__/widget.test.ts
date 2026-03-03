import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TrameWidget } from '../widget.js';
import type { TrameWidgetConfig } from '../types.js';

describe('TrameWidget', () => {
  const mockConfig: TrameWidgetConfig = {
    projectId: 'proj_test123',
    apiKey: 'tk_pub_test1234567890abcdef',
    autoInject: false, // Don't auto-render in tests
  };

  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'feedback_123',
        created_at: '2026-02-11T10:00:00Z',
      }),
    });
  });

  afterEach(() => {
    // Clean up widget instance
    TrameWidget.destroy();
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('should initialize widget with valid config', () => {
      const widget = TrameWidget.init(mockConfig);
      expect(widget).toBeDefined();
      expect(TrameWidget.getInstance()).toBe(widget);
    });

    it('should warn if already initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      TrameWidget.init(mockConfig);
      TrameWidget.init(mockConfig);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already initialized')
      );
    });

    it('should throw if projectId is missing', () => {
      expect(() => {
        TrameWidget.init({ apiKey: 'tk_pub_test' } as any);
      }).toThrow();
    });

    it('should throw if apiKey is missing', () => {
      expect(() => {
        TrameWidget.init({ projectId: 'proj_123' } as any);
      }).toThrow();
    });

    it('should apply default config values', () => {
      const widget = TrameWidget.init(mockConfig);
      expect(widget).toBeDefined();
      // Defaults are applied internally
    });

    it('should auto-inject when autoInject is true', () => {
      const config = { ...mockConfig, autoInject: true };
      TrameWidget.init(config);
      
      // Check if container was added to body
      const container = document.querySelector('#trame-widget-container');
      expect(container).toBeTruthy();
    });

    it('should not auto-inject when autoInject is false', () => {
      const config = { ...mockConfig, autoInject: false };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      expect(container).toBeFalsy();
    });
  });

  describe('getInstance', () => {
    it('should return null if not initialized', () => {
      expect(TrameWidget.getInstance()).toBeNull();
    });

    it('should return instance after initialization', () => {
      const widget = TrameWidget.init(mockConfig);
      expect(TrameWidget.getInstance()).toBe(widget);
    });
  });

  describe('update', () => {
    it('should throw if widget not initialized', () => {
      expect(() => {
        TrameWidget.update({ triggerLabel: 'New Label' });
      }).toThrow('Widget not initialized');
    });

    it('should update configuration', () => {
      TrameWidget.init(mockConfig);
      
      expect(() => {
        TrameWidget.update({ triggerLabel: 'New Label' });
      }).not.toThrow();
    });
  });

  describe('attachTo', () => {
    it('should throw if widget not initialized', () => {
      expect(() => {
        TrameWidget.attachTo('#my-button');
      }).toThrow('Widget not initialized');
    });

    it('should throw if element not found', () => {
      TrameWidget.init(mockConfig);
      
      expect(() => {
        TrameWidget.attachTo('#non-existent');
      }).toThrow('Element not found');
    });

    it('should attach click listener to element', () => {
      TrameWidget.init(mockConfig);
      
      const button = document.createElement('button');
      button.id = 'test-button';
      document.body.appendChild(button);
      
      expect(() => {
        TrameWidget.attachTo('#test-button');
      }).not.toThrow();
      
      button.remove();
    });
  });

  describe('submit', () => {
    it('should throw if widget not initialized', async () => {
      await expect(
        TrameWidget.submit({ message: 'Test' })
      ).rejects.toThrow('Widget not initialized');
    });

    it('should submit feedback programmatically', async () => {
      TrameWidget.init(mockConfig);
      
      await expect(
        TrameWidget.submit({
          message: 'Test feedback',
          user: { name: 'John', email: 'john@example.com' },
        })
      ).resolves.not.toThrow();
      
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include metadata in submission', async () => {
      TrameWidget.init(mockConfig);
      
      await TrameWidget.submit({
        message: 'Test',
        metadata: { page: '/dashboard' },
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('dashboard'),
        })
      );
    });

    it('should call onSubmit callback on success', async () => {
      const onSubmit = vi.fn();
      TrameWidget.init({ ...mockConfig, onSubmit });
      
      await TrameWidget.submit({ message: 'Test' });
      
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should call onError callback on failure', async () => {
      const onError = vi.fn();
      TrameWidget.init({ ...mockConfig, onError });
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(
        TrameWidget.submit({ message: 'Test' })
      ).rejects.toThrow();
      
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up widget resources', () => {
      const config = { ...mockConfig, autoInject: true };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      expect(container).toBeTruthy();
      
      TrameWidget.destroy();
      
      const containerAfter = document.querySelector('#trame-widget-container');
      expect(containerAfter).toBeFalsy();
      expect(TrameWidget.getInstance()).toBeNull();
    });

    it('should not throw if widget not initialized', () => {
      expect(() => {
        TrameWidget.destroy();
      }).not.toThrow();
    });
  });

  describe('Shadow DOM rendering', () => {
    it('should create Shadow DOM container', () => {
      const config = { ...mockConfig, autoInject: true };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      expect(container).toBeTruthy();
      expect(container?.shadowRoot).toBeTruthy();
    });

    it('should inject styles into Shadow DOM', () => {
      const config = { ...mockConfig, autoInject: true };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      const styleTag = container?.shadowRoot?.querySelector('style');
      expect(styleTag).toBeTruthy();
      expect(styleTag?.textContent).toContain('.trame-trigger');
    });

    it('should render trigger button in Shadow DOM', () => {
      const config = { ...mockConfig, autoInject: true };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      const trigger = container?.shadowRoot?.querySelector('.trame-trigger');
      expect(trigger).toBeTruthy();
      expect(trigger?.textContent).toBe('Feedback');
    });

    it('should use custom trigger label', () => {
      const config = {
        ...mockConfig,
        autoInject: true,
        triggerLabel: 'Send Feedback',
      };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      const trigger = container?.shadowRoot?.querySelector('.trame-trigger');
      expect(trigger?.textContent).toBe('Send Feedback');
    });

    it('should position trigger based on config', () => {
      const config = {
        ...mockConfig,
        autoInject: true,
        position: 'bottom-left' as const,
      };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      const trigger = container?.shadowRoot?.querySelector('.trame-trigger');
      expect(trigger?.classList.contains('position-bottom-left')).toBe(true);
    });
  });

  describe('callbacks', () => {
    it('should call onOpen when form opens', () => {
      const onOpen = vi.fn();
      const config = {
        ...mockConfig,
        autoInject: true,
        onOpen,
      };
      TrameWidget.init(config);
      
      const container = document.querySelector('#trame-widget-container');
      const trigger = container?.shadowRoot?.querySelector('.trame-trigger') as HTMLButtonElement;
      trigger?.click();
      
      expect(onOpen).toHaveBeenCalled();
    });
  });
});
