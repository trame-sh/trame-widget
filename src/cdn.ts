/**
 * CDN entry point with command-queue bootstrap pattern
 * 
 * This file creates the IIFE bundle that can be loaded via script tag.
 * It processes queued commands that were called before the script loaded.
 */

import { TrameWidget } from './widget.js';
import type { TrameWidgetConfig } from './types.js';

// Command queue type
type CommandQueue = Array<[string, ...any[]]>;

interface TrameGlobal {
  (command: string, ...args: any[]): void;
  q?: CommandQueue;
}

declare global {
  interface Window {
    Trame?: TrameGlobal;
  }
}

/**
 * Process a single command
 */
function processCommand(command: string, ...args: any[]): void {
  switch (command) {
    case 'init':
      TrameWidget.init(args[0] as TrameWidgetConfig);
      break;
    case 'update':
      TrameWidget.update(args[0] as Partial<TrameWidgetConfig>);
      break;
    case 'attachTo':
      TrameWidget.attachTo(args[0] as string);
      break;
    case 'submit':
      TrameWidget.submit(args[0]).catch(console.error);
      break;
    case 'destroy':
      TrameWidget.destroy();
      break;
    default:
      console.warn(`Unknown Trame command: ${command}`);
  }
}

/**
 * Main function that replaces the stub
 */
function Trame(command: string, ...args: any[]): void {
  processCommand(command, ...args);
}

// Process queued commands
if (typeof window !== 'undefined' && window.Trame) {
  const queue = window.Trame.q || [];
  
  // Replace stub with real implementation
  window.Trame = Trame as any;
  
  // Process all queued commands
  queue.forEach(([command, ...args]) => {
    processCommand(command, ...args);
  });
}

// Expose for direct access
if (typeof window !== 'undefined') {
  window.Trame = Trame as any;
}

export { Trame };
