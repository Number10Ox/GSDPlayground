import { test, expect } from './fixtures/base';
import {
  startConflict,
  raiseWithDice,
  seeWithDice,
  giveUp,
  escalateTo,
  confirmEscalation,
  verifyEscalationLevel,
  verifyBiddingHistoryEntry,
  verifyConflictResolved,
  waitForNPCTurn,
  dismissResolution,
  getAvailableDiceCount,
} from './steps/conflict.steps';
import { setupCharacterForTest } from './steps/character.steps';

test.describe('Conflict System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select Bridal Falls from town selection
    await page.getByTestId('select-town-bridal-falls').click();
    // Create character and skip arrival to reach EXPLORING phase
    await setupCharacterForTest(page);
  });

  test('Scenario: Basic raise and see exchange', async ({ page }) => {
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Player raises
    await raiseWithDice(page, 2);

    // Wait for NPC to respond (see and raise)
    await waitForNPCTurn(page);

    // Check if conflict is still active (NPC might have given up)
    const conflictStillActive = await page.getByTestId('give-button').isVisible().catch(() => false);

    if (conflictStillActive) {
      // Verify bidding history shows activity
      await verifyBiddingHistoryEntry(page, 'Raised');

      // Now player should be able to see
      await seeWithDice(page, 2);

      // Verify see recorded (could be Block/Dodge, Reversed, or Took the Blow depending on dice used)
      await verifyBiddingHistoryEntry(page, 'Saw');
    } else {
      // NPC gave up - conflict resolved, verify resolution
      await verifyConflictResolved(page);
    }
  });

  test('Scenario: Player gives up', async ({ page }) => {
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Player raises
    await raiseWithDice(page, 2);

    // Wait for NPC turn
    await waitForNPCTurn(page);

    // Player gives up
    await giveUp(page);

    // Verify conflict resolved
    await verifyConflictResolved(page);
  });

  test('Scenario: Escalation to physical', async ({ page }) => {
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Verify starting at JUST_TALKING
    await verifyEscalationLevel(page, 'player', 'just_talking');

    // Get initial dice count
    const initialDiceCount = await getAvailableDiceCount(page);

    // Escalate to physical
    await escalateTo(page, 'physical');

    // Verify modal is visible
    await expect(page.getByTestId('escalation-confirm-modal')).toBeVisible();

    // Confirm escalation
    await confirmEscalation(page);

    // Verify player escalation level changed
    await verifyEscalationLevel(page, 'player', 'physical');

    // Verify dice pool increased (got new dice from escalation)
    const newDiceCount = await getAvailableDiceCount(page);
    expect(newDiceCount).toBeGreaterThan(initialDiceCount);
  });

  test('Scenario: Escalation to gunplay has delay', async ({ page }) => {
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Escalate through levels to get to FIGHTING first
    await escalateTo(page, 'physical');
    await confirmEscalation(page);

    await escalateTo(page, 'fighting');
    await confirmEscalation(page);

    // Now escalate to gunplay
    await escalateTo(page, 'gunplay');

    // Confirm button should be disabled initially
    const confirmBtn = page.getByTestId('escalation-confirm-button');
    await expect(confirmBtn).toBeDisabled();

    // Wait for delay (1.5 seconds)
    await page.waitForTimeout(1600);

    // Button should now be enabled
    await expect(confirmBtn).toBeEnabled();

    // Confirm escalation
    await confirmBtn.click();

    // Verify gunplay level
    await verifyEscalationLevel(page, 'player', 'gunplay');
  });

  test('Scenario: Taking the blow shows in bidding history', async ({ page }) => {
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Player raises (uses 2 of 4 dice, leaving 2 in pool)
    await raiseWithDice(page, 2);

    // Wait for NPC to see and raise
    await waitForNPCTurn(page);

    // Escalate to PHYSICAL to get 2 more dice (pool: 2 → 4)
    // This ensures we have 3+ dice available to see with
    await escalateTo(page, 'physical');
    await confirmEscalation(page);

    // Player sees with 3+ dice (take the blow)
    await seeWithDice(page, 3);

    // Verify "Takes the Blow" in history
    await verifyBiddingHistoryEntry(page, 'Takes the Blow');
  });

  test('Scenario: Conflict resolution shows fallout reveal', async ({ page }) => {
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Quick conflict: raise then give
    await raiseWithDice(page, 2);
    await waitForNPCTurn(page);

    // Give up to trigger resolution
    await giveUp(page);

    // Verify resolution screen
    await verifyConflictResolved(page);

    // Verify fallout reveal appears
    await expect(page.getByTestId('fallout-reveal')).toBeVisible();

    // Wait for fallout reveal animation
    await page.waitForTimeout(4500);

    // Verify continue button becomes enabled
    await expect(page.getByTestId('resolution-continue-button')).toBeEnabled();
  });

  test('Scenario: Full conflict cycle with resolution dismiss', async ({ page }) => {
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Play through a brief conflict
    await raiseWithDice(page, 2);
    await waitForNPCTurn(page);
    await giveUp(page);

    // Wait for resolution
    await verifyConflictResolved(page);

    // Wait for fallout reveal
    await page.waitForTimeout(4500);

    // Dismiss resolution
    await dismissResolution(page);

    // Conflict view should close (conflict-view no longer visible)
    await expect(page.getByTestId('conflict-view')).not.toBeVisible();
  });
});
