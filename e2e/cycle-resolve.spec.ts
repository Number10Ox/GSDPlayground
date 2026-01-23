import { test, expect } from './fixtures/base';
import {
  navigateToGame,
  startDay,
  selectFirstAvailableDie,
  assignDieToAction,
  confirmAllocations,
  continuePastResolve,
  continuePastSummary,
  expectResolveScreenVisible,
  expectCycleSummaryVisible,
  expectRestOverlayVisible,
  navigateToLocation,
  expectDicePoolVisible,
  expectActionPanelVisible,
} from './steps/cycle.steps';



/**
 * BDD: Day should NOT end after resolving a single action.
 *
 * Given the player is in the ALLOCATE phase
 * When they assign a die to an action and confirm
 * Then the RESOLVE screen should appear and wait for user input
 * And the day should NOT advance to REST without user clicks
 *
 * This test guards against the race condition where React state updates
 * from action resolution effects (DISCOVER_CLUE, ADVANCE_CLOCK) caused
 * the RESOLVE phase to auto-skip to SUMMARY → REST.
 */
test.describe('Cycle Resolve Phase - No Auto-Dismiss', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToGame(page);
  });

  test('resolve screen appears after confirming allocations and waits for Continue click', async ({ page }) => {
    // Given: Day started, in ALLOCATE phase
    await startDay(page);
    await expectDicePoolVisible(page);
    await expectActionPanelVisible(page);

    // When: Assign a die to Pray for Guidance and confirm
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Pray for Guidance');
    await confirmAllocations(page);

    // Then: RESOLVE screen should appear with Continue button
    await expectResolveScreenVisible(page);

    // And: After 3 seconds the resolve screen should STILL be visible (no auto-dismiss)
    await page.waitForTimeout(3000);
    await expectResolveScreenVisible(page);

    // And: Summary should NOT be visible yet
    await expect(page.getByTestId('cycle-summary-overlay')).not.toBeVisible();
  });

  test('investigate action at homestead shows resolve screen without auto-advancing', async ({ page }) => {
    // Given: Day started
    await startDay(page);
    await expectDicePoolVisible(page);

    // When: Navigate to homestead location
    await navigateToLocation(page, 'homestead');

    // And: Wait for actions to regenerate for new location
    await page.waitForTimeout(500);

    // And: Assign die to investigate action if available, otherwise use any action
    const investigateAction = page.locator('[data-testid="action-card"]', { hasText: /investigate/i });
    await selectFirstAvailableDie(page);

    if (await investigateAction.isVisible({ timeout: 1000 }).catch(() => false)) {
      await investigateAction.click();
    } else {
      // Fallback: assign to first available action at this location
      await page.locator('[data-testid="action-card"]').first().click();
    }

    await confirmAllocations(page);

    // Then: RESOLVE screen should appear
    await expectResolveScreenVisible(page);

    // And: Should still be on RESOLVE after waiting (no auto-skip)
    await page.waitForTimeout(3000);
    await expectResolveScreenVisible(page);

    // And: REST overlay should NOT be visible
    await expect(page.getByTestId('cycle-rest-overlay')).not.toBeVisible();
  });

  test('full cycle requires manual progression through each phase', async ({ page }) => {
    // Given: Day started
    await startDay(page);

    // When: Allocate and confirm
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Pray for Guidance');
    await confirmAllocations(page);

    // Then: Must click through RESOLVE
    await expectResolveScreenVisible(page);
    await continuePastResolve(page);

    // Then: Must click through SUMMARY
    await expectCycleSummaryVisible(page);
    await continuePastSummary(page);

    // Then: REST overlay shows, day has NOT silently ended
    await expectRestOverlayVisible(page);
    await expect(page.getByText('Night Falls')).toBeVisible();
  });

  test('resolve screen displays action results before allowing continue', async ({ page }) => {
    // Given: Day started
    await startDay(page);

    // When: Assign die and confirm
    await selectFirstAvailableDie(page);
    await assignDieToAction(page, 'Pray for Guidance');
    await confirmAllocations(page);

    // Then: Resolve screen should show action results text
    await expectResolveScreenVisible(page);
    const resolvePanel = page.locator('.bg-surface.rounded-lg.p-6');
    await expect(resolvePanel.getByText('Actions Resolved')).toBeVisible();

    // And: At least one result should be displayed
    const resultItems = resolvePanel.locator('.text-sm.p-2.rounded');
    await expect(resultItems).toHaveCount(1);
  });
});
