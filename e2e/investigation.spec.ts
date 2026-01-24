import { test, expect } from './fixtures/base';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  startConversation,
  selectTopic,
  waitForResponse,
  closeDiscovery,
  endConversation,
  openMentalMap,
  closeMentalMap,
  createCharacterForTest,
  verifyDiscovery,
  verifySinNodeVisible,
  verifySinNodeDiscovered,
} from './steps/investigation.steps';
import { skipArrivalOverlay } from './steps/character.steps';

// Load dialogue recordings from fixture file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const recordingsPath = resolve(__dirname, 'fixtures/dialogue-recordings.json');
const dialogueRecordings: {
  recordings: Array<{ npcId: string; topic: string; response: string }>;
} = JSON.parse(readFileSync(recordingsPath, 'utf-8'));

/**
 * Investigation System E2E Tests
 *
 * Tests use route interception to provide deterministic dialogue responses
 * without calling a real LLM. Recordings are keyed by {npcId, topic}.
 *
 * The dialogue hook (useDialogue.tsx) fetches /api/dialogue with a streaming body.
 * For E2E tests, we intercept this route and return recorded responses.
 */

// Helper: find recorded response by matching request params
function findRecording(npcId: string, topic: string): string | null {
  const recording = dialogueRecordings.recordings.find(
    (r) => r.npcId === npcId && r.topic === topic
  );
  return recording?.response ?? null;
}

test.describe('Investigation System', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept dialogue API - return recorded responses as streaming text
    await page.route('**/api/dialogue', async (route) => {
      const request = route.request();
      let body: { npcId?: string; topic?: string } = {};

      try {
        const postData = request.postData();
        if (postData) {
          body = JSON.parse(postData);
        }
      } catch {
        // Fallback if body can't be parsed
      }

      const npcId = body.npcId ?? '';
      const topic = body.topic ?? '';

      const response = findRecording(npcId, topic);

      if (response) {
        await route.fulfill({
          status: 200,
          contentType: 'text/plain; charset=utf-8',
          body: response,
        });
      } else {
        // Fallback response for unrecorded combinations
        await route.fulfill({
          status: 200,
          contentType: 'text/plain; charset=utf-8',
          body: `[Player]: Tell me more.\n[NPC]: I have nothing more to say on that matter, Brother.`,
        });
      }
    });

    // Navigate to app
    await page.goto('/');
    // Select Bridal Falls from town selection
    await page.getByTestId('select-town-bridal-falls').click();
    await page.waitForLoadState('networkidle');

    // Create character
    await createCharacterForTest(page, 'Brother Ezekiel');

    // Skip town arrival overlay
    await skipArrivalOverlay(page);
  });

  test('player can start conversation with NPC', async ({ page }) => {
    // Navigate to general-store where sister-martha is
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation
    await startConversation(page, 'sister-martha');
    await expect(page.getByTestId('dialogue-view')).toBeVisible();

    // Topic chips should be visible (SELECTING_TOPIC phase)
    await expect(page.getByTestId('topic-chips')).toBeVisible();
  });

  test('player selects topic and gets response', async ({ page }) => {
    // Navigate to general-store
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation with martha
    await startConversation(page, 'sister-martha');

    // Select "the-town" topic - triggers sendMessage which fetches /api/dialogue
    await selectTopic(page, 'the-town', 'sister-martha');

    // Wait for response to stream and complete
    await waitForResponse(page);
  });

  test('discovery appears after revealing conversation', async ({ page }) => {
    // Navigate to general-store
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation
    await startConversation(page, 'sister-martha');

    // Select topic that yields a discovery
    await selectTopic(page, 'the-town', 'sister-martha');
    await waitForResponse(page);

    // Discovery summary should appear (response contains [DISCOVERY:...])
    await verifyDiscovery(page, 'Steward');
  });

  test('mental map updates with discovered sins', async ({ page }) => {
    // Navigate to general-store
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Discover a sin via conversation
    await startConversation(page, 'sister-martha');
    await selectTopic(page, 'the-town', 'sister-martha');
    await waitForResponse(page);

    // Close discovery and end conversation
    await closeDiscovery(page);
    await endConversation(page);

    // Open mental map
    await openMentalMap(page);

    // The injustice sin node should be visible and discovered (not showing "???")
    await verifySinNodeVisible(page, 'injustice');
    await verifySinNodeDiscovered(page, 'injustice');

    await closeMentalMap(page);
  });


  test('pressing the matter triggers conflict via approach selection', async ({ page }) => {
    // Navigate to sheriff's office
    await page.locator('[data-testid="map-node-sheriffs-office"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation with sheriff
    await startConversation(page, 'sheriff-jacob');

    // Select a trust-gated topic — the NPC should deflect
    await selectTopic(page, 'the-town', 'sheriff-jacob');
    await waitForResponse(page);

    // "Press the Matter" button should appear after deflection
    const pressButton = page.getByTestId('press-the-matter');
    await expect(pressButton).toBeVisible({ timeout: 5000 });

    // Click "Press the Matter" — triggers approach selection overlay
    await pressButton.click();

    // Approach selection overlay should appear
    const approachOverlay = page.getByTestId('approach-selection-overlay');
    await expect(approachOverlay).toBeVisible({ timeout: 3000 });

    // Select body approach to start the conflict
    await page.getByTestId('select-approach-body').click();

    // Conflict view should appear
    await expect(page.getByTestId('conflict-view')).toBeVisible({ timeout: 5000 });
  });
});
