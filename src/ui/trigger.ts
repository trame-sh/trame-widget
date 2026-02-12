import type { TrameWidgetConfig } from '../types.js';

/**
 * Floating trigger button component
 */
export class TriggerButton {
  private button: HTMLButtonElement;

  constructor(
    private config: TrameWidgetConfig,
    private onClick: () => void
  ) {
    this.button = this.createButton();
  }

  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `trame-trigger position-${this.config.position || 'bottom-right'}`;
    button.textContent = this.config.triggerLabel || 'Feedback';
    button.setAttribute('aria-label', 'Open feedback form');
    button.addEventListener('click', () => this.onClick());
    return button;
  }

  /**
   * Mount trigger button to container
   */
  mount(container: ShadowRoot): void {
    container.appendChild(this.button);
  }

  /**
   * Update button label
   */
  updateLabel(label: string): void {
    this.button.textContent = label;
  }

  /**
   * Show the button
   */
  show(): void {
    this.button.classList.remove('hidden');
  }

  /**
   * Hide the button
   */
  hide(): void {
    this.button.classList.add('hidden');
  }

  /**
   * Remove the button from DOM
   */
  destroy(): void {
    this.button.remove();
  }
}
