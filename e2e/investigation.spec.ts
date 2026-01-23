import { test, expect } from './fixtures/base';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  startConversation,
  selectTopic,
  selectApproach,
  waitForResponse,
  closeDiscovery,
  endConversation,
  openMentalMap,
  closeMentalMap,
  verifyFatigue,
  advanceCycle,
  createCharacterForTest,
  startInvestigation,
  verifyDiscovery,
  verifySinNodeVisible,
  verifySinNodeDiscovered,
  triggerConflict,
} from './steps/investigation.steps';

// Load dialogue recordings from fixture file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const recordingsPath = resolve(__dirname, 'fixtures/dialogue-recordings.json');
const dialogueRecordings: {
  recordings: Array<{ npcId: string; topic: string; approach: string; response: string }>;
} = JSON.parse(readFileSync(recordingsPath, 'utf-8'));

/**
 * Investigation System E2E Tests
 *
 * Tests use route interception to provide deterministic dialogue responses
 * without calling a real LLM. Recordings are keyed by {npcId, topic, approach}.
 *
 * The dialogue hook (useDialogue.tsx) fetches /api/dialogue with a streaming body.
 * For E2E tests, we intercept this route and return recorded responses.
 */

// Helper: find recorded response by matching request params
function findRecording(npcId: string, topic: string, approach: string): string | null {
  const recording = dialogueRecordings.recordings.find(
    (r) => r.npcId === npcId && r.topic === topic && r.approach === approach
  );
  return recording?.response ?? null;
}

test.describe('Investigation System', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept dialogue API - return recorded responses as streaming text
    await page.route('**/api/dialogue', async (route) => {
      const request = route.request();
      let body: { npcId?: string; topic?: string; approach?: string } = {};

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
      const approach = body.approach ?? '';

      const response = findRecording(npcId, topic, approach);

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

    // Create character (needed for approach chips to render)
    await createCharacterForTest(page, 'Brother Ezekiel');

    // Investigation auto-starts on mount; ensure fatigue clock is visible
    await startInvestigation(page);

    // Start the day to dismiss wake overlay (allows map interaction)
    const startDayBtn = page.getByTestId('start-day-button');
    await expect(startDayBtn).toBeVisible({ timeout: 3000 });
    await startDayBtn.click();
    await page.waitForTimeout(500);
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

    // Fatigue should be at 0/6 (no conversations yet)
    await verifyFatigue(page, 0, 6);
  });

  test('player selects topic then approach', async ({ page }) => {
    // Navigate to general-store
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation with martha
    await startConversation(page, 'sister-martha');

    // Select "the-town" topic
    await selectTopic(page, 'the-town', 'sister-martha');

    // Approach chips should be visible
    await expect(page.getByTestId('approach-chips')).toBeVisible();
    await expect(page.getByTestId('approach-chip-acuity')).toBeVisible();

    // Select acuity approach - triggers sendMessage which fetches /api/dialogue
    await selectApproach(page, 'acuity');

    // Wait for response to stream and complete
    await waitForResponse(page);

    // Fatigue should advance to 1/6
    await verifyFatigue(page, 1, 6);
  });

  test('discovery appears after revealing conversation', async ({ page }) => {
    // Navigate to general-store
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation
    await startConversation(page, 'sister-martha');

    // Select topic and approach that yields a discovery
    await selectTopic(page, 'the-town', 'sister-martha');
    await selectApproach(page, 'acuity');
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
    await selectApproach(page, 'acuity');
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

  test('fatigue prevents conversations when exhausted', async ({ page }) => {
    // Navigate to general-store
    await page.locator('[data-testid="map-node-general-store"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Exhaust fatigue (6 conversations)
    for (let i = 0; i < 6; i++) {
      await startConversation(page, 'sister-martha');
      await selectTopic(page, 'greeting', 'sister-martha');
      await selectApproach(page, 'heart');
      await waitForResponse(page);

      // Close discovery if it appeared
      const discoverySummary = page.getByTestId('discovery-summary');
      const isDiscoveryVisible = await discoverySummary.isVisible().catch(() => false);
      if (isDiscoveryVisible) {
        await closeDiscovery(page);
      }
      await endConversation(page);
    }

    // Verify fatigue is at 6/6
    await verifyFatigue(page, 6, 6);

    // Try to start another conversation - should be blocked
    await page.getByTestId('npc-button-sister-martha').click();

    // Dialogue should NOT open
    await expect(page.getByTestId('dialogue-view')).not.toBeVisible({ timeout: 2000 });

    // Fatigue warning toast should appear
    await expect(page.getByTestId('fatigue-warning')).toBeVisible({ timeout: 2000 });
  });

  test('sin escalation on cycle end', async ({ page }) => {
    // Open mental map before cycle to see initial state
    await openMentalMap(page);
    const initialNodes = await page.locator('[data-testid^="sin-node-"]').count();
    await closeMentalMap(page);

    // Advance cycle (triggers ADVANCE_SIN_PROGRESSION in REST phase)
    await advanceCycle(page);

    // Open mental map after cycle - should have a new sin node
    await openMentalMap(page);
    const afterNodes = await page.locator('[data-testid^="sin-node-"]').count();

    // Sin chain should have grown (new escalated node added)
    expect(afterNodes).toBeGreaterThan(initialNodes);

    await closeMentalMap(page);
  });

  test('aggressive approach can trigger conflict', async ({ page }) => {
    // Navigate to sheriff's office
    await page.locator('[data-testid="map-node-sheriffs-office"]').dispatchEvent('click');
    await page.waitForTimeout(500);

    // Start conversation with sheriff
    await startConversation(page, 'sheriff-jacob');

    // Select topic and body approach (can trigger conflict)
    await selectTopic(page, 'the-town', 'sheriff-jacob');
    await selectApproach(page, 'body');

    // After the response streams and completes, the ConflictTrigger component
    // renders (forceTriggered in dev mode). It shows a warning message briefly
    // then triggers the conflict after 1s delay. We need to catch either:
    // 1. The conflict-trigger element (if we check fast enough)
    // 2. The conflict-view element (after the conflict starts)
    // Wait for either conflict-trigger or conflict-view to appear
    const conflictTrigger = page.getByTestId('conflict-trigger');
    const conflictView = page.getByTestId('conflict-view');

    await Promise.race([
      expect(conflictTrigger).toBeVisible({ timeout: 10000 }),
      expect(conflictView).toBeVisible({ timeout: 10000 }),
    ]);

    // Verify conflict was triggered (either trigger or view visible)
    const hasTrigger = await conflictTrigger.isVisible().catch(() => false);
    const hasView = await conflictView.isVisible().catch(() => false);
    expect(hasTrigger || hasView).toBeTruthy();
  });
});
