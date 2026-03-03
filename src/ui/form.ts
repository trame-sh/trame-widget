import type { TrameWidgetConfig, FeedbackSubmission, WidgetState } from '../types.js';

/**
 * Feedback form modal component
 */
export class FeedbackForm {
  private overlay: HTMLDivElement | null = null;
  private state: WidgetState = 'idle';
  private errorMessage: string | null = null;

  constructor(
    private config: TrameWidgetConfig,
    private onSubmit: (data: FeedbackSubmission) => Promise<void>,
    private onClose: () => void
  ) {}

  /**
   * Create and mount the form
   */
  mount(container: ShadowRoot): void {
    this.overlay = this.createOverlay();
    container.appendChild(this.overlay);
  }

  /**
   * Create overlay and modal
   */
  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'trame-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    const modal = document.createElement('div');
    modal.className = 'trame-modal';
    modal.innerHTML = this.getModalHTML();

    // Attach event listeners
    modal.querySelector('.trame-close-button')?.addEventListener('click', () => this.close());
    modal.querySelector('.trame-button-secondary')?.addEventListener('click', () => this.close());
    modal.querySelector('form')?.addEventListener('submit', (e) => this.handleSubmit(e));

    overlay.appendChild(modal);
    return overlay;
  }

  /**
   * Get modal HTML
   */
  private getModalHTML(): string {
    const title = this.config.formTitle || 'Send Feedback';
    const userName = this.config.user?.name || '';
    const userEmail = this.config.user?.email || '';

    return `
      <div class="trame-modal-header">
        <h2 class="trame-modal-title">${this.escapeHtml(title)}</h2>
        <button class="trame-close-button" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="trame-modal-body">
        <div id="trame-message-container"></div>
        <form id="trame-feedback-form">
          <div class="trame-form-group">
            <label class="trame-form-label" for="trame-message">
              Message
            </label>
            <textarea
              id="trame-message"
              name="message"
              class="trame-form-textarea"
              placeholder="Tell us what's on your mind..."
              required
              maxlength="5000"
            ></textarea>
          </div>
          <div class="trame-form-group">
            <label class="trame-form-label" for="trame-name">
              Name <span class="optional">(optional)</span>
            </label>
            <input
              id="trame-name"
              name="name"
              type="text"
              class="trame-form-input"
              placeholder="Your name"
              value="${this.escapeHtml(userName)}"
              maxlength="255"
            />
          </div>
          <div class="trame-form-group">
            <label class="trame-form-label" for="trame-email">
              Email <span class="optional">(optional)</span>
            </label>
            <input
              id="trame-email"
              name="email"
              type="email"
              class="trame-form-input"
              placeholder="your@email.com"
              value="${this.escapeHtml(userEmail)}"
              maxlength="255"
            />
          </div>
        </form>
      </div>
      <div class="trame-modal-footer">
        <button type="button" class="trame-button trame-button-secondary">Cancel</button>
        <button type="submit" form="trame-feedback-form" class="trame-button trame-button-primary" id="trame-submit-btn">
          Send Feedback
        </button>
      </div>
    `;
  }

  /**
   * Handle form submission
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (this.state === 'submitting') return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const message = formData.get('message') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // Basic validation
    if (!message || message.trim().length === 0) {
      this.showError('Please enter a message');
      return;
    }

    // Update state to submitting
    this.setState('submitting');
    this.clearMessage();

    const submission: FeedbackSubmission = {
      message: message.trim(),
      user: {},
      metadata: {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      },
    };

    if (name.trim()) submission.user!.name = name.trim();
    if (email.trim()) submission.user!.email = email.trim();
    if (this.config.user?.id) submission.user!.id = this.config.user.id;

    try {
      await this.onSubmit(submission);
      this.setState('success');
      this.showSuccess('Thank you for your feedback!');

      // Auto-close after 2 seconds
      setTimeout(() => {
        this.close();
      }, 2000);
    } catch (error) {
      this.setState('error');
      this.showError(error instanceof Error ? error.message : 'Failed to submit feedback');
    }
  }

  /**
   * Update widget state
   */
  private setState(state: WidgetState): void {
    this.state = state;
    this.updateSubmitButton();
  }

  /**
   * Update submit button based on state
   */
  private updateSubmitButton(): void {
    if (!this.overlay) return;

    const submitBtn = this.overlay.querySelector('#trame-submit-btn') as HTMLButtonElement;
    if (!submitBtn) return;

    switch (this.state) {
      case 'submitting':
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="trame-loading"></span>Sending...';
        break;
      case 'success':
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sent!';
        break;
      case 'error':
        submitBtn.disabled = false;
        submitBtn.textContent = 'Try Again';
        break;
      default:
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
    }
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.showMessage(message, 'success');
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.errorMessage = message;
    this.showMessage(message, 'error');
  }

  /**
   * Show message
   */
  private showMessage(message: string, type: 'success' | 'error'): void {
    if (!this.overlay) return;

    const container = this.overlay.querySelector('#trame-message-container');
    if (!container) return;

    const messageEl = document.createElement('div');
    messageEl.className = `trame-message trame-message-${type}`;
    messageEl.textContent = message;

    container.innerHTML = '';
    container.appendChild(messageEl);
  }

  /**
   * Clear message
   */
  private clearMessage(): void {
    if (!this.overlay) return;
    const container = this.overlay.querySelector('#trame-message-container');
    if (container) container.innerHTML = '';
  }

  /**
   * Close the form
   */
  close(): void {
    this.overlay?.remove();
    this.overlay = null;
    this.state = 'idle';
    this.errorMessage = null;
    this.onClose();
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if form is open
   */
  isOpen(): boolean {
    return this.overlay !== null;
  }
}
