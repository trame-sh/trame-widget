/**
 * Test setup file for vitest
 */

import { beforeEach, afterEach } from 'vitest';

// Clean up after each test
afterEach(() => {
  // Remove any widget containers
  const containers = document.querySelectorAll('#trame-widget-container');
  containers.forEach(container => container.remove());
  
  // Clean up any overlays
  const overlays = document.querySelectorAll('.trame-overlay');
  overlays.forEach(overlay => overlay.remove());
});
