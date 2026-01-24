import { test, expect } from './fixtures/base';
import {
  setupCharacterForTest,
  skipArrivalOverlay,
} from './steps/character.steps';
import {
  startConversation,
} from './steps/investigation.steps';

/**
 * Dialogue Rework E2E Tests
 *
 * Tests the Phase 6.1 dialogue changes:
 * - Player voice options (DialogueOptionCards with tone/stat indicators)
 * - "Press the Matter" conflict entry flow
 *
 * The dialogue flow works as follows:
 * 1. Player selects a topic chip -> generateOptions() calls /api/dialogue-options
 * 2. Options returned -> SELECTING_OPTION phase shows DialogueOptionCards
 * 3. Player clicks an option -> sendSelectedOption() calls /api/dialogue for NPC response
 * 4. If NPC deflects ([DEFLECTED] marker), "Press the Matter" button appears
 *
 * Tests intercept both /api/dialogue-options and /api/dialogue routes
 * to provide deterministic responses.
 */

/** Mock dialogue options returned by /api/dialogue-options */
const MOCK_OPTIONS = [
  {
    id: 'opt-1',
    text: 'I understand this weighs on you. Tell me what troubles your heart.',
    tone: 'compassionate',
    associatedStat: 'heart',
    risky: false,
    convictionAligned: false,
  },
  {
    id: 'opt-2',
    text: 'I have heard whispers. What are you not telling me?',
    tone: 'inquisitive',
    associatedStat: 'acuity',
    risky: false,
    convictionAligned: false,
  },
  {
    id: 'opt-3',
    text: 'I am a Dog of the King of Life. You will speak plainly.',
    tone: 'authoritative',
    associatedStat: 'will',
    risky: true,
    riskDescription: 'May break trust',
    convictionAligned: false,
  },
];

test.describe('Dialogue Rework', () => {
  test('player sees voice options after selecting a topic', async ({ page }) => {
    // Intercept /api/dialogue-options to return mock options
    await page.route('**/api/dialogue-options', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ options: MOCK_OPTIONS }),
      });
    });

    // Intercept /api/dialogue for any NPC response (shouldn't be called yet)
    await page.route('**/api/dialogue', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: 'The town has its troubles, Brother. But we manage.',
      });
    });

    await page.goto('/');
    await page.getByTestId('select-town-bridal-falls').click();
    await setupCharacterForTest(page, 'Brother Test');

    // Navigate to general-store where sister-martha is
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation
    await startConversation(page, 'sister-martha');

    // Verify topic chips are visible
    await expect(page.getByTestId('topic-chips')).toBeVisible();

    // Click a topic chip - this triggers generateOptions which calls /api/dialogue-options
    const topicChip = page.locator('[data-testid^="topic-chip-sister-martha-"]').first();
    await expect(topicChip).toBeVisible({ timeout: 3000 });
    await topicChip.click();

    // Verify dialogue option cards appear (SELECTING_OPTION phase)
    const firstOption = page.getByTestId('dialogue-option-opt-1');
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Verify at least 2 options are shown
    const optionCards = page.locator('[data-testid^="dialogue-option-"]');
    const optionCount = await optionCards.count();
    expect(optionCount).toBeGreaterThanOrEqual(2);

    // Verify tone text is visible on options
    await expect(firstOption).toContainText('compassionate');
    const secondOption = page.getByTestId('dialogue-option-opt-2');
    await expect(secondOption).toContainText('inquisitive');
  });

  test('selecting a dialogue option triggers NPC response', async ({ page }) => {
    const responseText = 'Brother, the Steward weighs heavy on all of us. His word has become law here.';

    // Intercept /api/dialogue-options to return mock options
    await page.route('**/api/dialogue-options', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ options: MOCK_OPTIONS }),
      });
    });

    // Intercept /api/dialogue to return NPC response text
    await page.route('**/api/dialogue', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: responseText,
      });
    });

    await page.goto('/');
    await page.getByTestId('select-town-bridal-falls').click();
    await setupCharacterForTest(page, 'Sister Hannah');

    // Navigate to general-store
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation and select topic
    await startConversation(page, 'sister-martha');
    const topicChip = page.locator('[data-testid^="topic-chip-sister-martha-"]').first();
    await expect(topicChip).toBeVisible({ timeout: 3000 });
    await topicChip.click();

    // Wait for options to appear
    await expect(page.getByTestId('dialogue-option-opt-1')).toBeVisible({ timeout: 5000 });

    // Click the first dialogue option
    await page.getByTestId('dialogue-option-opt-1').click();

    // Wait for streaming response to complete (dialogue-continue button appears)
    const continueBtn = page.getByTestId('dialogue-continue');
    await expect(continueBtn).toBeVisible({ timeout: 10000 });

    // Verify response text appears in dialogue view
    const dialogueView = page.getByTestId('dialogue-view');
    await expect(dialogueView).toContainText('Steward');
  });

  test('Press the Matter appears after NPC deflection', async ({ page }) => {
    // Intercept /api/dialogue-options to return mock options
    await page.route('**/api/dialogue-options', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ options: MOCK_OPTIONS }),
      });
    });

    // Intercept /api/dialogue to return a [DEFLECTED] response
    await page.route('**/api/dialogue', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: 'You push too hard, Brother. I answer to the Steward, not to wandering Dogs.\n[DEFLECTED]',
      });
    });

    await page.goto('/');
    await page.getByTestId('select-town-bridal-falls').click();
    await setupCharacterForTest(page, 'Brother Marcus');

    // Navigate to sheriff's office
    await page.locator('[data-testid="map-node-sheriffs-office"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation with sheriff
    await startConversation(page, 'sheriff-jacob');

    // Select a topic
    const topicChip = page.locator('[data-testid^="topic-chip-sheriff-jacob-"]').first();
    await expect(topicChip).toBeVisible({ timeout: 3000 });
    await topicChip.click();

    // Wait for dialogue options
    await expect(page.getByTestId('dialogue-option-opt-1')).toBeVisible({ timeout: 5000 });

    // Select a dialogue option
    await page.getByTestId('dialogue-option-opt-1').click();

    // Wait for response to complete
    const continueBtn = page.getByTestId('dialogue-continue');
    await expect(continueBtn).toBeVisible({ timeout: 10000 });
    await continueBtn.click();

    // "Press the Matter" button should appear after deflection
    const pressButton = page.getByTestId('press-the-matter');
    await expect(pressButton).toBeVisible({ timeout: 5000 });
  });

  test('Press the Matter leads to approach selection then conflict', async ({ page }) => {
    // Intercept /api/dialogue-options to return mock options
    await page.route('**/api/dialogue-options', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ options: MOCK_OPTIONS }),
      });
    });

    // Intercept /api/dialogue to return a [DEFLECTED] response
    await page.route('**/api/dialogue', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: 'That is none of your concern, Dog. Move along.\n[DEFLECTED]',
      });
    });

    await page.goto('/');
    await page.getByTestId('select-town-bridal-falls').click();
    await setupCharacterForTest(page, 'Sister Grace');

    // Navigate to sheriff's office
    await page.locator('[data-testid="map-node-sheriffs-office"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation with sheriff
    await startConversation(page, 'sheriff-jacob');

    // Select a topic
    const topicChip = page.locator('[data-testid^="topic-chip-sheriff-jacob-"]').first();
    await expect(topicChip).toBeVisible({ timeout: 3000 });
    await topicChip.click();

    // Wait for dialogue options and select one
    await expect(page.getByTestId('dialogue-option-opt-1')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('dialogue-option-opt-1').click();

    // Wait for response and acknowledge
    const continueBtn = page.getByTestId('dialogue-continue');
    await expect(continueBtn).toBeVisible({ timeout: 10000 });
    await continueBtn.click();

    // "Press the Matter" should appear
    const pressButton = page.getByTestId('press-the-matter');
    await expect(pressButton).toBeVisible({ timeout: 5000 });

    // Click "Press the Matter"
    await pressButton.click();

    // Approach selection overlay should appear
    const approachOverlay = page.getByTestId('approach-selection-overlay');
    await expect(approachOverlay).toBeVisible({ timeout: 5000 });

    // Select body approach
    await page.getByTestId('select-approach-body').click();

    // Conflict view should appear
    await expect(page.getByTestId('conflict-view')).toBeVisible({ timeout: 5000 });
  });
});
