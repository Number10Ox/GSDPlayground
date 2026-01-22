import { test as base, expect } from '@playwright/test';

// Extend base test with app-specific fixtures
export const test = base.extend<{
  // Future: add game state fixtures here
}>({
  // Placeholder for game fixtures
});

export { expect };
