import { Page, expect } from '@playwright/test';

/**
 * Reusable step functions for cycle E2E tests.
 *
 * These are helper functions (not cucumber-style step definitions)
 * that encapsulate common test operations for the cycle system.
 */

export async function navigateToGame(page: Page) {
  await page.goto('/');
  // Select first town (Bridal Falls) from town selection screen
  const selectButton = page.getByTestId('select-town-bridal-falls');
  if (await selectButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await selectButton.click();
  }
}

export async function startDay(page: Page) {
  await page.getByTestId('start-day-button').click();
}

export async function selectFirstAvailableDie(page: Page) {
  const die = page.getByTestId('die').first();
  await die.click();
  return die;
}

export async function selectDieByIndex(page: Page, index: number) {
  const die = page.getByTestId('die').nth(index);
  await die.click();
  return die;
}

export async function assignDieToAction(page: Page, actionName: string) {
  // Find action card containing the action name and click it
  const actionCard = page.locator('[data-testid="action-card"]', { hasText: actionName });
  await actionCard.click();
}

export async function confirmAllocations(page: Page) {
  await page.getByTestId('confirm-allocations-button').click();
}

export async function continuePastSummary(page: Page) {
  await page.getByTestId('continue-button').click();
}

export async function goToNextDay(page: Page) {
  await page.getByTestId('next-day-button').click();
}

export async function restEarly(page: Page) {
  await page.getByTestId('rest-early-button').click();
}

export async function expectDayNumber(page: Page, day: number) {
  await expect(page.getByTestId('day-number')).toContainText(`Day ${day}`);
}

export async function expectDicePoolVisible(page: Page) {
  await expect(page.getByTestId('dice-pool')).toBeVisible();
}

export async function expectActionPanelVisible(page: Page) {
  await expect(page.getByTestId('action-panel')).toBeVisible();
}

export async function expectCycleSummaryVisible(page: Page) {
  await expect(page.getByTestId('cycle-summary-overlay')).toBeVisible();
}

export async function expectWakeOverlayVisible(page: Page) {
  await expect(page.getByTestId('cycle-wake-overlay')).toBeVisible();
}

export async function expectRestOverlayVisible(page: Page) {
  await expect(page.getByTestId('cycle-rest-overlay')).toBeVisible();
}

export async function getDiceCount(page: Page): Promise<number> {
  return page.getByTestId('die').count();
}

export async function getActionCardByName(page: Page, actionName: string) {
  return page.locator('[data-testid="action-card"]', { hasText: actionName });
}
