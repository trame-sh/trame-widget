/**
 * CSS-in-JS styles for the widget
 * Injected into Shadow DOM for isolation
 */

export const getStyles = (theme: 'light' | 'dark' | 'auto'): string => {
  return `
    :host {
      /* CSS Custom Properties for theming */
      --trame-color-primary: #3b82f6;
      --trame-color-primary-hover: #2563eb;
      --trame-color-text: #1f2937;
      --trame-color-text-secondary: #6b7280;
      --trame-color-bg: #ffffff;
      --trame-color-bg-secondary: #f9fafb;
      --trame-color-border: #e5e7eb;
      --trame-color-error: #ef4444;
      --trame-color-success: #10b981;
      --trame-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --trame-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --trame-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --trame-radius: 8px;
      --trame-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    ${theme === 'dark' || (theme === 'auto' && '@media (prefers-color-scheme: dark)') ? `
    :host {
      --trame-color-primary: #60a5fa;
      --trame-color-primary-hover: #3b82f6;
      --trame-color-text: #f9fafb;
      --trame-color-text-secondary: #d1d5db;
      --trame-color-bg: #1f2937;
      --trame-color-bg-secondary: #111827;
      --trame-color-border: #374151;
    }
    ` : ''}

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Trigger Button */
    .trame-trigger {
      position: fixed;
      z-index: 999999;
      bottom: 24px;
      background: var(--trame-color-primary);
      color: white;
      border: none;
      border-radius: var(--trame-radius);
      padding: 12px 20px;
      font-family: var(--trame-font-family);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: var(--trame-shadow-lg);
      transition: all 0.2s ease;
    }

    .trame-trigger:hover {
      background: var(--trame-color-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -5px rgb(0 0 0 / 0.15);
    }

    .trame-trigger.position-bottom-right {
      right: 24px;
    }

    .trame-trigger.position-bottom-left {
      left: 24px;
    }

    /* Modal Overlay */
    .trame-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000000;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Modal Dialog */
    .trame-modal {
      background: var(--trame-color-bg);
      border-radius: var(--trame-radius);
      box-shadow: var(--trame-shadow-lg);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow: auto;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Modal Header */
    .trame-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid var(--trame-color-border);
    }

    .trame-modal-title {
      font-family: var(--trame-font-family);
      font-size: 18px;
      font-weight: 600;
      color: var(--trame-color-text);
    }

    .trame-close-button {
      background: none;
      border: none;
      color: var(--trame-color-text-secondary);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.15s ease;
    }

    .trame-close-button:hover {
      background: var(--trame-color-bg-secondary);
      color: var(--trame-color-text);
    }

    /* Modal Body */
    .trame-modal-body {
      padding: 20px;
    }

    /* Form */
    .trame-form-group {
      margin-bottom: 16px;
    }

    .trame-form-label {
      display: block;
      font-family: var(--trame-font-family);
      font-size: 14px;
      font-weight: 500;
      color: var(--trame-color-text);
      margin-bottom: 6px;
    }

    .trame-form-label .optional {
      font-weight: 400;
      color: var(--trame-color-text-secondary);
    }

    .trame-form-input,
    .trame-form-textarea {
      width: 100%;
      padding: 10px 12px;
      font-family: var(--trame-font-family);
      font-size: 14px;
      color: var(--trame-color-text);
      background: var(--trame-color-bg);
      border: 1px solid var(--trame-color-border);
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    .trame-form-input:focus,
    .trame-form-textarea:focus {
      outline: none;
      border-color: var(--trame-color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .trame-form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .trame-form-error {
      font-family: var(--trame-font-family);
      font-size: 13px;
      color: var(--trame-color-error);
      margin-top: 4px;
    }

    /* Buttons */
    .trame-modal-footer {
      display: flex;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid var(--trame-color-border);
    }

    .trame-button {
      flex: 1;
      padding: 10px 20px;
      font-family: var(--trame-font-family);
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .trame-button-primary {
      background: var(--trame-color-primary);
      color: white;
    }

    .trame-button-primary:hover:not(:disabled) {
      background: var(--trame-color-primary-hover);
    }

    .trame-button-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .trame-button-secondary {
      background: var(--trame-color-bg-secondary);
      color: var(--trame-color-text);
      border: 1px solid var(--trame-color-border);
    }

    .trame-button-secondary:hover {
      background: var(--trame-color-border);
    }

    /* Success/Error Messages */
    .trame-message {
      padding: 16px;
      border-radius: 6px;
      font-family: var(--trame-font-family);
      font-size: 14px;
      margin-bottom: 16px;
    }

    .trame-message-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--trame-color-success);
      border: 1px solid var(--trame-color-success);
    }

    .trame-message-error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--trame-color-error);
      border: 1px solid var(--trame-color-error);
    }

    /* Loading State */
    .trame-loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Hidden */
    .hidden {
      display: none !important;
    }
  `;
};
