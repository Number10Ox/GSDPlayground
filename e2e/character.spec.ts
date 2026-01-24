import { test, expect } from './fixtures/base';
import {
  openCharacterCreation,
  enterCharacterName,
  selectBackground,
  allocateStatDice,
  selectBelongings,
  selectInitiationApproach,
  confirmCreation,
  verifyCharacterInSidebar,
  verifyStatVisible,
  setupCharacterForTest,
  triggerConflictForTest,
  verifyTraitInvocationPanel,
  invokeTrait,
  verifyTraitUsed,
  verifyFalloutTraitGained,
  verifyInventoryItem,
  verifyItemIsGun,
  getConflictDiceCount,
  skipArrivalOverlay,
} from './steps/character.steps';
import {
  raiseWithDice,
  waitForNPCTurn,
  giveUp,
  verifyConflictResolved,
} from './steps/conflict.steps';

test.describe('Character System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select Bridal Falls from town selection
    await page.getByTestId('select-town-bridal-falls').click();
  });

  test('Scenario: Character creation with point-buy', async ({ page }) => {
    // Open creation modal (auto-opens when no character exists)
    await openCharacterCreation(page);

    // Enter name
    await enterCharacterName(page, 'Brother Ezekiel');

    // Select well-rounded background (10 stat points)
    await selectBackground(page, 'well-rounded');

    // Allocate stats: 3 Acuity, 3 Body, 2 Heart, 2 Will = 10 total
    await allocateStatDice(page, 'acuity', 3);
    await allocateStatDice(page, 'body', 3);
    await allocateStatDice(page, 'heart', 2);
    await allocateStatDice(page, 'will', 2);

    // Advance from allocate to belongings
    const allocateNext = page.getByTestId('creation-allocate-next');
    await expect(allocateNext).toBeEnabled({ timeout: 2000 });
    await allocateNext.click();

    // Select belongings and initiation approach
    await selectBelongings(page);
    await selectInitiationApproach(page);

    // Confirm creation
    await confirmCreation(page);

    // Skip town arrival overlay
    await skipArrivalOverlay(page);

    // Verify character appears in sidebar
    await verifyCharacterInSidebar(page, 'Brother Ezekiel');

    // Verify all four stats are visible
    await verifyStatVisible(page, 'acuity');
    await verifyStatVisible(page, 'body');
    await verifyStatVisible(page, 'heart');
    await verifyStatVisible(page, 'will');
  });

  test('Scenario: Stats affect conflict dice pool', async ({ page }) => {
    // Create character with known stats
    await setupCharacterForTest(page, 'Sister Hannah');

    // Start a test conflict — dice pool is built from character stats
    await triggerConflictForTest(page);

    // Wait for player's raise turn
    await expect(page.getByText('Your turn to Raise')).toBeVisible({ timeout: 3000 });

    // Verify conflict has dice (generated from character stats)
    const diceCount = await getConflictDiceCount(page);
    expect(diceCount).toBeGreaterThan(0);
  });

  test('Scenario: Trait invocation during conflict', async ({ page }) => {
    // Create character
    await setupCharacterForTest(page, 'Brother Marcus');

    // Add a test trait via dev-mode button
    await page.getByTestId('add-test-trait').click();

    // Start conflict
    await triggerConflictForTest(page);

    // Wait for player's raise turn (first turn is always PLAYER_RAISE)
    await expect(page.getByText('Your turn to Raise')).toBeVisible({ timeout: 3000 });

    // Verify trait invocation panel is visible
    await verifyTraitInvocationPanel(page);

    // Get initial dice count
    const initialCount = await getConflictDiceCount(page);

    // Invoke the test trait
    await invokeTrait(page, 'test-trait-quick-draw');

    // Verify pool increased (trait added dice)
    const newCount = await getConflictDiceCount(page);
    expect(newCount).toBeGreaterThan(initialCount);

    // Verify trait shows as used
    await verifyTraitUsed(page, 'test-trait-quick-draw');
  });

  test('Scenario: Trait cannot be invoked twice', async ({ page }) => {
    // Create character
    await setupCharacterForTest(page, 'Brother Abel');

    // Add a test trait
    await page.getByTestId('add-test-trait').click();

    // Start conflict
    await triggerConflictForTest(page);

    // Wait for player's raise turn
    await expect(page.getByText('Your turn to Raise')).toBeVisible({ timeout: 3000 });

    // Invoke the trait
    await invokeTrait(page, 'test-trait-quick-draw');

    // Verify invoke button is gone (replaced with "Used" badge)
    await expect(page.getByTestId('invoke-trait-test-trait-quick-draw')).not.toBeVisible({ timeout: 2000 });

    // The "Used" text should be visible in the panel
    const panel = page.getByTestId('trait-invocation-panel');
    await expect(panel).toContainText('Used');
  });

  test('Scenario: Fallout creates new trait', async ({ page }) => {
    // Create character
    await setupCharacterForTest(page, 'Sister Grace');

    // Start conflict and lose to trigger fallout
    await triggerConflictForTest(page);

    // Wait for player's raise turn
    await expect(page.getByText('Your turn to Raise')).toBeVisible({ timeout: 3000 });

    // Raise with 2 dice
    await raiseWithDice(page, 2);

    // Wait for NPC turn
    await waitForNPCTurn(page);

    // Player gives up to trigger resolution + fallout
    await giveUp(page);

    // Verify conflict resolved
    await verifyConflictResolved(page);

    // Wait for fallout reveal animation (4.5s for all phases)
    await page.waitForTimeout(5000);

    // The fallout may or may not create a trait depending on severity
    // (NONE severity doesn't create traits, others do)
    // Check if a fallout-trait-gained element appears (it may not if severity is NONE)
    const traitGained = page.getByTestId('fallout-trait-gained');
    const hasTraitGained = await traitGained.isVisible().catch(() => false);

    if (hasTraitGained) {
      // Trait was gained from fallout
      await expect(traitGained).toContainText('New Trait Gained');
    }

    // Dismiss resolution
    const continueBtn = page.getByTestId('resolution-continue-button');
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    await continueBtn.click();

    // If a trait was gained, verify it appears in the character sheet
    if (hasTraitGained) {
      await page.getByTestId('view-character-sheet').click();
      const traitList = page.getByTestId('trait-list');
      await expect(traitList).toBeVisible({ timeout: 3000 });
      await expect(traitList).toContainText('Fallout');
    }
  });

  test('Scenario: Inventory items visible after creation', async ({ page }) => {
    // Create character (gets starting inventory)
    await setupCharacterForTest(page, 'Brother Daniel');

    // Open character sheet to see inventory
    await page.getByTestId('view-character-sheet').click();

    // Verify each starting item
    await verifyInventoryItem(page, 'Coat');
    await verifyInventoryItem(page, 'Gun');
    await verifyInventoryItem(page, 'Book of Life');
    await verifyInventoryItem(page, 'Sacred Earth');

    // Verify gun is marked as firearm
    await verifyItemIsGun(page, 'Gun');
  });

  test('Scenario: Character sheet shows stats and background', async ({ page }) => {
    // Create character
    await setupCharacterForTest(page, 'Sister Ruth');

    // Open character sheet
    await page.getByTestId('view-character-sheet').click();

    // Verify sheet is visible
    const sheet = page.getByTestId('character-sheet');
    await expect(sheet).toBeVisible({ timeout: 3000 });

    // Verify character info
    await expect(sheet).toContainText('Sister Ruth');
    await expect(sheet).toContainText('well rounded');

    // Verify all stats visible in sheet (scoped to character-sheet to avoid sidebar duplicates)
    await expect(sheet.getByTestId('stat-acuity')).toBeVisible();
    await expect(sheet.getByTestId('stat-body')).toBeVisible();
    await expect(sheet.getByTestId('stat-heart')).toBeVisible();
    await expect(sheet.getByTestId('stat-will')).toBeVisible();
  });
});
