import type { TrameWidgetConfig, FeedbackSubmission, FeedbackPayload } from './types.js';
import { FeedbackAPI } from './api.js';
import { getStyles } from './ui/styles.js';
import { TriggerButton } from './ui/trigger.js';
import { FeedbackForm } from './ui/form.js';

/**
 * Core widget class with Shadow DOM rendering
 */
export class TrameWidget {
  private static instance: TrameWidget | null = null;
  private config: TrameWidgetConfig;
  private api: FeedbackAPI;
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private trigger: TriggerButton | null = null;
  private form: FeedbackForm | null = null;

  private constructor(config: TrameWidgetConfig) {
    FeedbackAPI.validateConfig(config);
    
    this.config = {
      theme: 'auto',
      position: 'bottom-right',
      triggerLabel: 'Feedback',
      formTitle: 'Send Feedback',
      autoInject: true,
      ...config,
    };

    this.api = new FeedbackAPI(this.config);
  }

  /**
   * Initialize the widget (singleton)
   */
  static init(config: TrameWidgetConfig): TrameWidget {
    if (TrameWidget.instance) {
      console.warn('Trame widget already initialized. Use TrameWidget.update() to change config.');
      return TrameWidget.instance;
    }

    TrameWidget.instance = new TrameWidget(config);

    if (config.autoInject !== false) {
      TrameWidget.instance.render();
    }

    return TrameWidget.instance;
  }

  /**
   * Get the current widget instance
   */
  static getInstance(): TrameWidget | null {
    return TrameWidget.instance;
  }

  /**
   * Update widget configuration
   */
  static update(config: Partial<TrameWidgetConfig>): void {
    const instance = TrameWidget.getInstance();
    if (!instance) {
      throw new Error('Widget not initialized. Call TrameWidget.init() first.');
    }

    instance.config = { ...instance.config, ...config };
    
    // Update trigger label if changed
    if (config.triggerLabel && instance.trigger) {
      instance.trigger.updateLabel(config.triggerLabel);
    }
  }

  /**
   * Attach widget to a custom element (BYOUI)
   */
  static attachTo(selector: string): void {
    const instance = TrameWidget.getInstance();
    if (!instance) {
      throw new Error('Widget not initialized. Call TrameWidget.init() first.');
    }

    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    element.addEventListener('click', () => {
      instance.openForm();
    });
  }

  /**
   * Submit feedback programmatically (BYOUI)
   */
  static async submit(submission: FeedbackSubmission): Promise<void> {
    const instance = TrameWidget.getInstance();
    if (!instance) {
      throw new Error('Widget not initialized. Call TrameWidget.init() first.');
    }

    await instance.submitFeedback(submission);
  }

  /**
   * Destroy the widget
   */
  static destroy(): void {
    const instance = TrameWidget.getInstance();
    if (instance) {
      instance.cleanup();
      TrameWidget.instance = null;
    }
  }

  /**
   * Render the widget
   */
  private render(): void {
    if (typeof document === 'undefined') {
      console.warn('Trame widget requires a browser environment');
      return;
    }

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'trame-widget-container';

    // Attach Shadow DOM for style isolation
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = getStyles(this.config.theme!);
    this.shadowRoot.appendChild(styleSheet);

    // Create trigger button
    this.trigger = new TriggerButton(this.config, () => this.openForm());
    this.trigger.mount(this.shadowRoot);

    // Append to body
    document.body.appendChild(this.container);
  }

  /**
   * Open feedback form
   */
  private openForm(): void {
    if (!this.shadowRoot) {
      console.error('Widget not rendered');
      return;
    }

    // Close existing form if open
    if (this.form?.isOpen()) {
      return;
    }

    // Hide trigger
    this.trigger?.hide();

    // Create and mount form
    this.form = new FeedbackForm(
      this.config,
      (data) => this.submitFeedback(data),
      () => this.closeForm()
    );
    this.form.mount(this.shadowRoot);

    // Call onOpen callback
    this.config.onOpen?.();
  }

  /**
   * Close feedback form
   */
  private closeForm(): void {
    this.form = null;
    this.trigger?.show();
  }

  /**
   * Submit feedback to API
   */
  private async submitFeedback(submission: FeedbackSubmission): Promise<void> {
    const payload: FeedbackPayload = {
      project_id: this.config.projectId,
      message: submission.message,
      source_url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_name: submission.user?.name,
      user_email: submission.user?.email,
      user_external_id: submission.user?.id || this.config.user?.id,
      metadata: submission.metadata,
    };

    try {
      const response = await this.api.submitFeedback(payload);
      
      // Call onSubmit callback
      this.config.onSubmit?.({ ...submission, metadata: { ...submission.metadata, id: response.id } });
    } catch (error) {
      // Call onError callback
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.trigger?.destroy();
    this.form?.close();
    this.container?.remove();
    this.container = null;
    this.shadowRoot = null;
    this.trigger = null;
    this.form = null;
  }
}
