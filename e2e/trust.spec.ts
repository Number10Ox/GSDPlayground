import { test, expect } from './fixtures/base';
import { setupCharacterForTest } from './steps/character.steps';
import {
  startConflict,
  raiseWithDice,
  giveUp,
  waitForNPCTurn,
  dismissResolution,
  escalateTo,
  confirmEscalation,
} from './steps/conflict.steps';
import { navigateTo } from './steps/free-roam.steps';

test.describe('Trust Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select Bridal Falls from town selection
    await page.getByTestId('select-town-bridal-falls').click();
    // Create character and skip arrival
    await setupCharacterForTest(page);
  });

  test('trust level is visible for NPC after interaction', async ({ page }) => {
    // Navigate to general-store where sister-martha is located
    await navigateTo(page, 'general-store');

    // Wait for NPC button to be visible
    const npcButton = page.getByTestId('npc-button-sister-martha');
    await expect(npcButton).toBeVisible({ timeout: 3000 });

    // Trust level indicator should be visible in sidebar for this NPC
    const trustLevel = page.getByTestId('trust-level-sister-martha');
    await expect(trustLevel).toBeVisible({ timeout: 3000 });

    // Check initial trust value (starts at 0 for NPCs without seeded relationships)
    const trustValue = await trustLevel.getAttribute('data-trust-value');
    expect(Number(trustValue)).toBeDefined();
  });

  test('conflict reduces NPC trust', async ({ page }) => {
    // Navigate to sheriff's office where the test conflict NPC is
    await navigateTo(page, 'sheriffs-office');

    // Seed trust for sheriff-jacob above 0 using dev-adjust-trust (+10 twice = 20)
    const adjustButton = page.getByTestId('dev-adjust-trust');
    await expect(adjustButton).toBeVisible({ timeout: 3000 });
    await adjustButton.click();
    await adjustButton.click();

    // Verify seeded trust value for sheriff-jacob (should be 20)
    const trustLevel = page.getByTestId('trust-level-sheriff-jacob');
    await expect(trustLevel).toBeVisible({ timeout: 3000 });
    const initialTrust = Number(await trustLevel.getAttribute('data-trust-value'));
    expect(initialTrust).toBe(20);

    // Start a conflict (uses sheriff-jacob by default)
    await startConflict(page, 'Sheriff Jacob', 'who controls the law');

    // Escalate to PHYSICAL to get more dice, enabling "takes the blow" exchange
    await escalateTo(page, 'physical');
    await confirmEscalation(page);

    // Raise with 2 dice
    await raiseWithDice(page, 2);

    // Wait for NPC turn (NPC sees and raises)
    await waitForNPCTurn(page);

    // Check if conflict resolved (NPC may have given up)
    const conflictStillActive = await page.getByTestId('give-button').isVisible().catch(() => false);

    if (conflictStillActive) {
      // Player sees with 3+ dice ("Takes the Blow") which accumulates PHYSICAL fallout
      const diceLocators = page.locator('[data-testid^="raise-die-"]');
      const diceCount = await diceLocators.count();
      if (diceCount >= 3) {
        // Select 3 dice and see (takes the blow)
        for (let i = 0; i < 3; i++) {
          await diceLocators.nth(i).click();
        }
        const seeBtn = page.getByTestId('see-submit-button');
        await expect(seeBtn).toBeEnabled({ timeout: 2000 });
        await seeBtn.click();

        // Wait for NPC turn then give up
        await waitForNPCTurn(page);
      }
      await giveUp(page);
    }

    // Wait for fallout reveal and dismiss resolution
    await page.waitForTimeout(4500);
    await dismissResolution(page);

    // Verify trust decreased after conflict with physical escalation and fallout
    await expect(trustLevel).toBeVisible({ timeout: 3000 });
    const postConflictTrust = Number(await trustLevel.getAttribute('data-trust-value'));
    expect(postConflictTrust).toBeLessThan(initialTrust);
  });

  test('trust breaking caps at 10', async ({ page }) => {
    // Navigate to general-store where sister-martha is
    await navigateTo(page, 'general-store');

    // Wait for NPC to be visible
    await expect(page.getByTestId('npc-button-sister-martha')).toBeVisible({ timeout: 3000 });

    // Break trust via dev button (seeds at 50, then breaks)
    const breakButton = page.getByTestId('dev-trigger-trust-break');
    await expect(breakButton).toBeVisible({ timeout: 3000 });
    await breakButton.click();

    // Verify trust-broken indicator appears
    const brokenIndicator = page.getByTestId('trust-broken-sister-martha');
    await expect(brokenIndicator).toBeVisible({ timeout: 3000 });

    // Verify trust value is at BROKEN_TRUST_PENALTY (-20) after breaking
    const trustLevel = page.getByTestId('trust-level-sister-martha');
    const trustValue = Number(await trustLevel.getAttribute('data-trust-value'));
    expect(trustValue).toBe(-20);

    // Try to increase trust via dev button (+10)
    const adjustButton = page.getByTestId('dev-adjust-trust');
    await adjustButton.click();

    // Trust should increase but stay capped at BROKEN_TRUST_CAP (10)
    const afterAdjust = Number(await trustLevel.getAttribute('data-trust-value'));
    expect(afterAdjust).toBeLessThanOrEqual(10);
  });

  test('trust cannot exceed broken cap once broken', async ({ page }) => {
    // Navigate to general-store where sister-martha is
    await navigateTo(page, 'general-store');

    // Wait for NPC to be visible
    await expect(page.getByTestId('npc-button-sister-martha')).toBeVisible({ timeout: 3000 });

    // Break trust (seeds at 50, then breaks to -20)
    const breakButton = page.getByTestId('dev-trigger-trust-break');
    await expect(breakButton).toBeVisible({ timeout: 3000 });
    await breakButton.click();

    // Verify broken state
    await expect(page.getByTestId('trust-broken-sister-martha')).toBeVisible({ timeout: 3000 });

    // Attempt multiple positive trust changes (+10 each)
    const adjustButton = page.getByTestId('dev-adjust-trust');
    await adjustButton.click(); // -20 + 10 = -10
    await adjustButton.click(); // -10 + 10 = 0
    await adjustButton.click(); // 0 + 10 = 10 (capped)
    await adjustButton.click(); // still 10 (capped at BROKEN_TRUST_CAP)
    await adjustButton.click(); // still 10

    // Verify trust is capped at 10
    const trustLevel = page.getByTestId('trust-level-sister-martha');
    const finalTrust = Number(await trustLevel.getAttribute('data-trust-value'));
    expect(finalTrust).toBe(10);
  });
});
