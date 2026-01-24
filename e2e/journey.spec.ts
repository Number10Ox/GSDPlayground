import { test, expect } from '@playwright/test';
import { createCharacter, skipArrival } from './steps/free-roam.steps';
import {
  triggerConvictionTest,
  completeTown,
  waitForReflection,
  reinforceConviction,
  doubtConviction,
  skipUntested,
  waitForJourneyProgress,
  advanceToNextTown,
} from './steps/journey.steps';

/**
 * Journey Flow E2E Tests
 *
 * Tests the multi-town journey system: town completion via judgment,
 * conviction reflection (reinforce/doubt/untested), JourneyProgress screen,
 * and continuation to next town.
 *
 * The journey flow is:
 * TOWN_ACTIVE -> (conviction tests during play) -> COMPLETE_TOWN ->
 * TOWN_REFLECTION -> RIDING_ON (JourneyProgress) -> ADVANCE_TO_NEXT_TOWN -> TOWN_ACTIVE
 *
 * Dev-mode buttons in GameView.tsx enable deterministic triggering:
 * - dev-trigger-test-conviction: Tests the first active conviction
 * - dev-complete-town: Completes town and transitions to TOWN_REFLECTION
 */

test.describe('Journey Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select Bridal Falls for deterministic setup
    await page.getByTestId('select-town-bridal-falls').click();
    // Create character with 3 convictions (mercy-faithful, justice-punished, faith-doctrine)
    await createCharacter(page);
    await skipArrival(page);
  });

  test('town completion triggers conviction reflection', async ({ page }) => {
    // Trigger a conviction test via dev button
    await triggerConvictionTest(page);

    // Complete the town (dispatches COMPLETE_TOWN + SET_PHASE: TOWN_REFLECTION)
    await completeTown(page);

    // Verify ConvictionReflection appears with "Conviction 1 of" text
    await waitForReflection(page);
    await expect(page.locator('text=Conviction 1 of')).toBeVisible();
  });

  test('reinforce conviction during reflection', async ({ page }) => {
    // Trigger a conviction test and complete town
    await triggerConvictionTest(page);
    await completeTown(page);

    // Wait for reflection screen
    await waitForReflection(page);

    // Click "Reinforce" - should transition to JourneyProgress
    // (only 1 conviction was tested, so after reinforcing it, reflection ends)
    await reinforceConviction(page);

    // Should transition to JourneyProgress ("The Road Ahead")
    await waitForJourneyProgress(page);
  });

  test('doubt conviction weakens it', async ({ page }) => {
    // Trigger a conviction test and complete town
    await triggerConvictionTest(page);
    await completeTown(page);

    // Wait for reflection screen
    await waitForReflection(page);

    // Click "Doubt" - should transition to JourneyProgress
    await doubtConviction(page);

    // Should transition to JourneyProgress
    await waitForJourneyProgress(page);
  });

  test('untested convictions skip reflection', async ({ page }) => {
    // Complete town WITHOUT triggering any conviction tests
    await completeTown(page);

    // Should show "Your convictions went untested" with "Ride On" button
    await skipUntested(page);

    // Should transition to JourneyProgress
    await waitForJourneyProgress(page);
  });

  test('JourneyProgress shows road ahead and continues to next town', async ({ page }) => {
    // Trigger test and complete town to reach JourneyProgress
    await triggerConvictionTest(page);
    await completeTown(page);
    await waitForReflection(page);
    await reinforceConviction(page);

    // Verify JourneyProgress content
    await waitForJourneyProgress(page);
    await expect(page.locator('text=Town 1 of 7')).toBeVisible();

    // Click "Continue to Next Town" - should return to town selection
    await advanceToNextTown(page);
  });
});
