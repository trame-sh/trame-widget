/**
 * Widget configuration options
 */
export interface TrameWidgetConfig {
  /** Project ID (required) */
  projectId: string;
  /** Publishable API key (required) */
  apiKey: string;
  /** Theme mode: 'light', 'dark', or 'auto' (default: 'auto') */
  theme?: 'light' | 'dark' | 'auto';
  /** Widget position (default: 'bottom-right') */
  position?: 'bottom-right' | 'bottom-left';
  /** Trigger button label (default: 'Feedback') */
  triggerLabel?: string;
  /** Form heading (default: 'Send Feedback') */
  formTitle?: string;
  /** Auto-inject trigger button (default: true) */
  autoInject?: boolean;
  /** End-user identification */
  user?: TrameUser;
  /** API endpoint (default: derived from current origin or production) */
  apiEndpoint?: string;
  /** Callback when widget opens */
  onOpen?: () => void;
  /** Callback when feedback is submitted */
  onSubmit?: (feedback: FeedbackSubmission) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * End-user information
 */
export interface TrameUser {
  /** User's display name */
  name?: string;
  /** User's email address */
  email?: string;
  /** External user ID in the customer's system */
  id?: string;
}

/**
 * Feedback submission data
 */
export interface FeedbackSubmission {
  /** Feedback message (required) */
  message: string;
  /** User information (optional) */
  user?: TrameUser;
  /** Custom metadata (optional) */
  metadata?: Record<string, any>;
}

/**
 * Internal feedback payload sent to API
 */
export interface FeedbackPayload extends FeedbackSubmission {
  project_id: string;
  source_url?: string;
  user_name?: string;
  user_email?: string;
  user_external_id?: string;
}

/**
 * API response from feedback submission
 */
export interface FeedbackResponse {
  id: string;
  created_at: string;
}

/**
 * Widget state
 */
export type WidgetState = 'idle' | 'open' | 'submitting' | 'success' | 'error';

/**
 * Error types
 */
export class WidgetError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'WidgetError';
  }
}
