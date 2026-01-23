Feature: Investigation System
  As a Dog arriving in a town
  I want to talk to NPCs and discover the sin progression
  So that I can address the root of the town's problems

  Background:
    Given the player has created a character
    And the investigation has started with the test town

  Scenario: Player starts a conversation with an NPC
    When the player clicks on Sister Martha
    Then the dialogue view should open
    And topic chips should be visible
    And the fatigue clock should show 0/6

  Scenario: Player selects topic and approach
    Given the player is in conversation with Sister Martha
    When the player selects the "the-town" topic
    Then approach chips should be visible
    When the player selects the "acuity" approach
    Then the dialogue text should appear
    And the fatigue clock should show 1/6

  Scenario: Player discovers a sin connection
    Given the player is in conversation with Sister Martha
    When the player completes a conversation about "the-town" with "acuity"
    Then the discovery summary should appear
    And the discovery should mention "Steward"

  Scenario: Mental map updates after discovery
    Given the player has discovered "injustice" sin
    When the player opens the mental map
    Then the "injustice" sin node should be visible
    And the sin node should not show "???"

  Scenario: Fatigue prevents extra conversations
    Given the player has used all 6 fatigue segments
    When the player clicks on an NPC
    Then the dialogue view should not open
    And a fatigue warning should appear

  Scenario: Sin escalation advances on cycle end
    Given the investigation has started
    When the player ends the cycle
    Then the sin progression should advance
    And a new sin node should appear in the chain

  Scenario: Conflict triggers from aggressive approach
    Given the player is in conversation with Sheriff Jacob
    When the player selects a "body" approach on a confrontational topic
    Then a conflict should trigger
    And the conflict view should appear
