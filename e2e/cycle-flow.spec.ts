import { test, expect } from './fixtures/base';
import {
  navigateToGame,
  startDay,
  selectFirstAvailableDie,
  assignDieToAction,
  confirmAllocations,
  continuePastSummary,
  goToNextDay,
  restEarly,
  expectDayNumber,
  expectDicePoolVisible,
  expectActionPanelVisible,
  expectCycleSummaryVisible,
  expectRestOverlayVisible,
  getDiceCount,
} from './steps/cycle.steps';

test.describe('Cycle System', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToGame(page);
  });

  test('starts on Day 1 with wake overlay', async ({ page }) => {
    await expect(page.getByTestId('cycle-wake-overlay')).toBeVisible();
    await expectDayNumber(page, 1);
  });

  test('clicking Start Day shows dice pool and actions', async ({ page }) => {
    await startDay(page);
    await expectDicePoolVisible(page);
    await expectActionPanelVisible(page);
  });

  test('can select a die and assign to action', async ({ page }) => {
    await startDay(page);

    // Count dice before
    const diceCountBefore = await getDiceCount(page);
    expect(diceCountBefore).toBeGreaterThan(0);

    // Select first die
    await selectFirstAvailableDie(page);

    // Assign to an action (using actual action name from game state)
    await assignDieToAction(page, 'Pray for Guidance');

    // Dice pool should have one fewer die
    const diceCountAfter = await getDiceCount(page);
    expect(diceCountAfter).toBe(diceCountBefore - 1);
  });

  test('confirm button disabled without assigned dice', async ({ page }) => {
    await startDay(page);

    const confirmButton = page.getByTestId('confirm-allocations-button');
    await expect(confirmButton).toBeDisabled();
  });

  test('confirm button enabled after assigning dice', async ({ page }) => {
    await startDay(page);
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Pray for Guidance');

    const confirmButton = page.getByTestId('confirm-allocations-button');
    await expect(confirmButton).toBeEnabled();
  });

  test('confirming allocations shows cycle summary', async ({ page }) => {
    await startDay(page);
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Pray for Guidance');
    await confirmAllocations(page);

    await expectCycleSummaryVisible(page);
  });

  test('full cycle: Day 1 -> allocate -> summary -> rest -> Day 2', async ({ page }) => {
    // Day 1 wake
    await expectDayNumber(page, 1);
    await startDay(page);

    // Allocate dice
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Talk to the Sheriff');
    await confirmAllocations(page);

    // Summary
    await expectCycleSummaryVisible(page);
    await continuePastSummary(page);

    // Rest phase
    await expectRestOverlayVisible(page);
    await expect(page.getByText('Night Falls')).toBeVisible();
    await goToNextDay(page);

    // Day 2 wake
    await expect(page.getByTestId('cycle-wake-overlay')).toBeVisible();
    await expectDayNumber(page, 2);
  });

  test('rest early skips directly to summary', async ({ page }) => {
    await startDay(page);
    await restEarly(page);

    await expectCycleSummaryVisible(page);
  });

  test('can assign multiple dice to different actions', async ({ page }) => {
    await startDay(page);

    const initialCount = await getDiceCount(page);

    // Assign first die
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Pray for Guidance');

    // Assign second die
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Investigate the Chapel');

    // Should have 2 fewer dice
    const finalCount = await getDiceCount(page);
    expect(finalCount).toBe(initialCount - 2);
  });

});
