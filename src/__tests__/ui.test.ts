import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TriggerButton } from '../ui/trigger.js';
import { FeedbackForm } from '../ui/form.js';
import type { TrameWidgetConfig } from '../types.js';

describe('TriggerButton', () => {
  const mockConfig: TrameWidgetConfig = {
    projectId: 'proj_test',
    apiKey: 'tk_pub_test',
    triggerLabel: 'Feedback',
    position: 'bottom-right',
  };

  let container: HTMLDivElement;
  let shadowRoot: ShadowRoot;

  beforeEach(() => {
    container = document.createElement('div');
    shadowRoot = container.attachShadow({ mode: 'open' });
  });

  it('should create trigger button with label', () => {
    const onClick = vi.fn();
    const trigger = new TriggerButton(mockConfig, onClick);
    trigger.mount(shadowRoot);

    const button = shadowRoot.querySelector('.trame-trigger');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Feedback');
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const trigger = new TriggerButton(mockConfig, onClick);
    trigger.mount(shadowRoot);

    const button = shadowRoot.querySelector('.trame-trigger') as HTMLButtonElement;
    button.click();

    expect(onClick).toHaveBeenCalled();
  });

  it('should apply position class', () => {
    const onClick = vi.fn();
    const trigger = new TriggerButton(mockConfig, onClick);
    trigger.mount(shadowRoot);

    const button = shadowRoot.querySelector('.trame-trigger');
    expect(button?.classList.contains('position-bottom-right')).toBe(true);
  });

  it('should update label', () => {
    const onClick = vi.fn();
    const trigger = new TriggerButton(mockConfig, onClick);
    trigger.mount(shadowRoot);

    trigger.updateLabel('New Label');

    const button = shadowRoot.querySelector('.trame-trigger');
    expect(button?.textContent).toBe('New Label');
  });

  it('should hide and show', () => {
    const onClick = vi.fn();
    const trigger = new TriggerButton(mockConfig, onClick);
    trigger.mount(shadowRoot);

    const button = shadowRoot.querySelector('.trame-trigger');

    trigger.hide();
    expect(button?.classList.contains('hidden')).toBe(true);

    trigger.show();
    expect(button?.classList.contains('hidden')).toBe(false);
  });

  it('should remove from DOM on destroy', () => {
    const onClick = vi.fn();
    const trigger = new TriggerButton(mockConfig, onClick);
    trigger.mount(shadowRoot);

    expect(shadowRoot.querySelector('.trame-trigger')).toBeTruthy();

    trigger.destroy();

    expect(shadowRoot.querySelector('.trame-trigger')).toBeFalsy();
  });
});

describe('FeedbackForm', () => {
  const mockConfig: TrameWidgetConfig = {
    projectId: 'proj_test',
    apiKey: 'tk_pub_test',
    formTitle: 'Send Feedback',
  };

  let container: HTMLDivElement;
  let shadowRoot: ShadowRoot;

  beforeEach(() => {
    container = document.createElement('div');
    shadowRoot = container.attachShadow({ mode: 'open' });
  });

  it('should create form modal', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    expect(shadowRoot.querySelector('.trame-overlay')).toBeTruthy();
    expect(shadowRoot.querySelector('.trame-modal')).toBeTruthy();
  });

  it('should display form title', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const title = shadowRoot.querySelector('.trame-modal-title');
    expect(title?.textContent).toBe('Send Feedback');
  });

  it('should pre-fill user info if provided', () => {
    const config = {
      ...mockConfig,
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    };
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(config, onSubmit, onClose);
    form.mount(shadowRoot);

    const nameInput = shadowRoot.querySelector('#trame-name') as HTMLInputElement;
    const emailInput = shadowRoot.querySelector('#trame-email') as HTMLInputElement;

    expect(nameInput?.value).toBe('John Doe');
    expect(emailInput?.value).toBe('john@example.com');
  });

  it('should call onClose when close button clicked', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const closeButton = shadowRoot.querySelector('.trame-close-button') as HTMLButtonElement;
    closeButton.click();

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button clicked', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const cancelButton = shadowRoot.querySelector('.trame-button-secondary') as HTMLButtonElement;
    cancelButton.click();

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay clicked', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const overlay = shadowRoot.querySelector('.trame-overlay') as HTMLDivElement;
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when modal clicked', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const modal = shadowRoot.querySelector('.trame-modal') as HTMLDivElement;
    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should validate required message field', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const formElement = shadowRoot.querySelector('form') as HTMLFormElement;
    const messageInput = shadowRoot.querySelector('#trame-message') as HTMLTextAreaElement;

    messageInput.value = '';
    formElement.dispatchEvent(new Event('submit'));

    // Should not call onSubmit with empty message
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const formElement = shadowRoot.querySelector('form') as HTMLFormElement;
    const messageInput = shadowRoot.querySelector('#trame-message') as HTMLTextAreaElement;
    const nameInput = shadowRoot.querySelector('#trame-name') as HTMLInputElement;
    const emailInput = shadowRoot.querySelector('#trame-email') as HTMLInputElement;

    messageInput.value = 'Test feedback';
    nameInput.value = 'John Doe';
    emailInput.value = 'john@example.com';

    formElement.dispatchEvent(new Event('submit'));

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test feedback',
        user: expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
        }),
        metadata: expect.any(Object),
      })
    );
  });

  it('should include metadata in submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const formElement = shadowRoot.querySelector('form') as HTMLFormElement;
    const messageInput = shadowRoot.querySelector('#trame-message') as HTMLTextAreaElement;

    messageInput.value = 'Test feedback';
    formElement.dispatchEvent(new Event('submit'));

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          userAgent: expect.any(String),
          viewport: expect.any(String),
          timestamp: expect.any(String),
        }),
      })
    );
  });

  it('should handle submission error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const formElement = shadowRoot.querySelector('form') as HTMLFormElement;
    const messageInput = shadowRoot.querySelector('#trame-message') as HTMLTextAreaElement;

    messageInput.value = 'Test feedback';
    formElement.dispatchEvent(new Event('submit'));

    await new Promise(resolve => setTimeout(resolve, 10));

    // Should show error message
    const errorMessage = shadowRoot.querySelector('.trame-message-error');
    expect(errorMessage).toBeTruthy();
  });

  it('should show success and auto-close after submission', async () => {
    vi.useFakeTimers();
    
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    const formElement = shadowRoot.querySelector('form') as HTMLFormElement;
    const messageInput = shadowRoot.querySelector('#trame-message') as HTMLTextAreaElement;

    messageInput.value = 'Test feedback';
    formElement.dispatchEvent(new Event('submit'));

    // Wait for async submission to complete
    await vi.waitFor(() => {
      const successMessage = shadowRoot.querySelector('.trame-message-success');
      expect(successMessage).toBeTruthy();
    });

    // Should auto-close after 2 seconds
    await vi.advanceTimersByTimeAsync(2000);
    expect(onClose).toHaveBeenCalled();

    vi.useRealTimers();
  }, 10000);

  it('should be closable', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(mockConfig, onSubmit, onClose);
    form.mount(shadowRoot);

    expect(form.isOpen()).toBe(true);

    form.close();

    expect(form.isOpen()).toBe(false);
    expect(shadowRoot.querySelector('.trame-overlay')).toBeFalsy();
  });

  it('should escape HTML in form title', () => {
    const config = {
      ...mockConfig,
      formTitle: '<script>alert("xss")</script>',
    };
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const form = new FeedbackForm(config, onSubmit, onClose);
    form.mount(shadowRoot);

    const title = shadowRoot.querySelector('.trame-modal-title');
    // textContent returns the actual text, innerHTML contains escaped HTML entities
    expect(title?.textContent).toBe('<script>alert("xss")</script>');
    expect(title?.innerHTML).toContain('&lt;script&gt;');
  });
});
