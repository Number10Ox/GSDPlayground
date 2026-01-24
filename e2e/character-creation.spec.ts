import { test, expect } from './fixtures/base';
import {
  openCharacterCreation,
  enterCharacterName,
  selectBackground,
  allocateStatDice,
  selectBelongings,
  selectInitiationApproach,
  selectConvictions,
  verifyCharacterInSidebar,
  skipArrivalOverlay,
} from './steps/character.steps';

/**
 * Character Creation Wizard E2E Tests
 *
 * Tests the full 6-step creation wizard introduced in Phase 6.1:
 * 1. Name input
 * 2. Background selection
 * 3. Stat allocation (point-buy)
 * 4. Belongings selection
 * 5. Initiation scene (approach selection)
 * 6. Conviction picker (select 3 seeds)
 *
 * Focuses on the conviction step (new in Phase 6.1) and verifying
 * the complete flow produces a character visible in the sidebar.
 */

test.describe('Character Creation Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select Bridal Falls from town selection
    await page.getByTestId('select-town-bridal-falls').click();
  });

  test('full 6-step wizard creates character with convictions', async ({ page }) => {
    // Step 1: Enter name
    await openCharacterCreation(page);
    await enterCharacterName(page, 'Brother Ezekiel');

    // Step 2: Select background
    await selectBackground(page, 'well-rounded');

    // Step 3: Allocate stats (3/3/2/2 = 10 total from well-rounded)
    await allocateStatDice(page, 'acuity', 3);
    await allocateStatDice(page, 'body', 3);
    await allocateStatDice(page, 'heart', 2);
    await allocateStatDice(page, 'will', 2);
    const allocateNext = page.getByTestId('creation-allocate-next');
    await expect(allocateNext).toBeEnabled({ timeout: 2000 });
    await allocateNext.click();

    // Step 4: Select 2 belongings
    await selectBelongings(page);

    // Step 5: Select first initiation approach, advance to convictions
    await selectInitiationApproach(page);

    // Step 6: Select 3 conviction seeds
    const firstSeed = page.getByTestId('conviction-seed-mercy-faithful');
    await expect(firstSeed).toBeVisible({ timeout: 3000 });
    await firstSeed.click();
    await page.getByTestId('conviction-seed-justice-punished').click();
    await page.getByTestId('conviction-seed-faith-doctrine').click();

    // Verify "0 remaining" text appears
    await expect(page.getByText('0 remaining')).toBeVisible();

    // Click "These Are My Beliefs"
    const confirmBtn = page.getByTestId('conviction-confirm');
    await expect(confirmBtn).toBeEnabled({ timeout: 2000 });
    await confirmBtn.click();

    // Verify: creation modal dismissed
    await expect(page.getByTestId('creation-name-input')).not.toBeVisible({ timeout: 3000 });

    // Skip arrival overlay
    await skipArrivalOverlay(page);

    // Verify: character name appears in sidebar
    await verifyCharacterInSidebar(page, 'Brother Ezekiel');
  });

  test('conviction picker enforces exactly 3 selections', async ({ page }) => {
    // Progress to step 6 (convictions)
    await openCharacterCreation(page);
    await enterCharacterName(page, 'Sister Faith');
    await selectBackground(page, 'well-rounded');
    await allocateStatDice(page, 'acuity', 3);
    await allocateStatDice(page, 'body', 3);
    await allocateStatDice(page, 'heart', 2);
    await allocateStatDice(page, 'will', 2);
    await page.getByTestId('creation-allocate-next').click();
    await selectBelongings(page);
    await selectInitiationApproach(page);

    // Wait for ConvictionPicker
    const firstSeed = page.getByTestId('conviction-seed-mercy-faithful');
    await expect(firstSeed).toBeVisible({ timeout: 3000 });

    // Click 1st conviction seed -> verify "2 remaining"
    await firstSeed.click();
    await expect(page.getByText('2 remaining')).toBeVisible();

    // Click 2nd conviction seed -> verify "1 remaining"
    await page.getByTestId('conviction-seed-justice-punished').click();
    await expect(page.getByText('1 remaining')).toBeVisible();

    // Verify confirm button is disabled (only 2 selected)
    const confirmBtn = page.getByTestId('conviction-confirm');
    await expect(confirmBtn).toBeDisabled();

    // Click 3rd conviction seed -> verify "0 remaining"
    await page.getByTestId('conviction-seed-faith-doctrine').click();
    await expect(page.getByText('0 remaining')).toBeVisible();

    // Verify confirm button is now enabled
    await expect(confirmBtn).toBeEnabled();

    // 4th conviction seed should be disabled (can't select more than 3)
    const fourthSeed = page.getByTestId('conviction-seed-community-family');
    await expect(fourthSeed).toBeDisabled();

    // Verify "0 remaining" is still shown (selection not changed)
    await expect(page.getByText('0 remaining')).toBeVisible();
  });

  test('conviction picker allows deselection', async ({ page }) => {
    // Progress to step 6 (convictions)
    await openCharacterCreation(page);
    await enterCharacterName(page, 'Brother Micah');
    await selectBackground(page, 'well-rounded');
    await allocateStatDice(page, 'acuity', 3);
    await allocateStatDice(page, 'body', 3);
    await allocateStatDice(page, 'heart', 2);
    await allocateStatDice(page, 'will', 2);
    await page.getByTestId('creation-allocate-next').click();
    await selectBelongings(page);
    await selectInitiationApproach(page);

    // Wait for ConvictionPicker
    const firstSeed = page.getByTestId('conviction-seed-mercy-faithful');
    await expect(firstSeed).toBeVisible({ timeout: 3000 });

    // Select 3 convictions
    await firstSeed.click();
    await page.getByTestId('conviction-seed-justice-punished').click();
    await page.getByTestId('conviction-seed-faith-doctrine').click();
    await expect(page.getByText('0 remaining')).toBeVisible();

    // Confirm button should be enabled
    const confirmBtn = page.getByTestId('conviction-confirm');
    await expect(confirmBtn).toBeEnabled();

    // Click first selected conviction again -> deselects it
    await firstSeed.click();

    // Back to "1 remaining"
    await expect(page.getByText('1 remaining')).toBeVisible();

    // Confirm button should now be disabled
    await expect(confirmBtn).toBeDisabled();
  });

  test('back button from convictions returns to initiation', async ({ page }) => {
    // Progress to step 6 (convictions)
    await openCharacterCreation(page);
    await enterCharacterName(page, 'Sister Leah');
    await selectBackground(page, 'well-rounded');
    await allocateStatDice(page, 'acuity', 3);
    await allocateStatDice(page, 'body', 3);
    await allocateStatDice(page, 'heart', 2);
    await allocateStatDice(page, 'will', 2);
    await page.getByTestId('creation-allocate-next').click();
    await selectBelongings(page);
    await selectInitiationApproach(page);

    // Wait for ConvictionPicker to render
    await expect(page.getByTestId('conviction-seed-mercy-faithful')).toBeVisible({ timeout: 3000 });

    // Click "Back" button
    await page.locator('button:has-text("Back")').click();

    // Verify initiation scene is visible again (approach buttons visible)
    const approachButton = page.locator('[data-testid^="creation-approach-"]').first();
    await expect(approachButton).toBeVisible({ timeout: 3000 });
  });

  test('character creation with complicated-history background', async ({ page }) => {
    // Step 1: Name
    await openCharacterCreation(page);
    await enterCharacterName(page, 'Sister Abigail');

    // Step 2: Select complicated-history background (8 stat points)
    await selectBackground(page, 'complicated-history');

    // Step 3: Allocate stats (2/2/2/2 = 8 total from complicated-history)
    await allocateStatDice(page, 'acuity', 2);
    await allocateStatDice(page, 'body', 2);
    await allocateStatDice(page, 'heart', 2);
    await allocateStatDice(page, 'will', 2);
    const allocateNext = page.getByTestId('creation-allocate-next');
    await expect(allocateNext).toBeEnabled({ timeout: 2000 });
    await allocateNext.click();

    // Step 4: Belongings
    await selectBelongings(page);

    // Step 5: Initiation
    await selectInitiationApproach(page);

    // Step 6: Convictions
    await selectConvictions(page);

    // Skip arrival overlay
    await skipArrivalOverlay(page);

    // Verify character in sidebar
    await verifyCharacterInSidebar(page, 'Sister Abigail');
  });
});
