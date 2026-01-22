Feature: Conflict System
  As a Dog in the Vineyard
  I want to engage in escalating conflicts
  So that I can resolve disputes with meaningful consequences

  Background:
    Given I am in the game
    And I start a conflict with "Sheriff Jacob" over "who controls the law in this town"

  Scenario: Basic raise and see exchange
    When I raise with 2 dice
    Then the NPC should see my raise
    When the NPC raises
    Then I should be able to see their raise
    And the bidding history should show all exchanges

  Scenario: Player gives up
    When I raise with 2 dice
    And the NPC sees my raise
    And the NPC raises
    When I choose to give
    Then the conflict should resolve
    And I should lose the stakes
    And fallout should be revealed

  Scenario: Escalation to physical
    Given the conflict is at "Just Talking"
    When I choose to escalate to "Physical"
    Then I should see an escalation confirmation
    And the confirmation should show an internal monologue
    When I confirm the escalation
    Then my escalation level should be "Physical"
    And I should receive new dice

  Scenario: Escalation to gunplay with extra warning
    Given the conflict is at "Fighting"
    When I choose to escalate to "Gunplay"
    Then the confirmation should emphasize lethality
    And the confirm button should be delayed
    When I confirm the escalation
    Then my escalation level should be "Gunplay"
    And I should receive 4 new d10 dice

  Scenario: Fallout severity based on escalation
    Given the conflict escalated to "Fighting"
    And I took the blow during the conflict
    When the conflict resolves
    Then fallout dice should be revealed dramatically
    And the severity should be calculated from the two highest dice

  Scenario: NPC witnesses remember violence
    Given "Brother Ezekiel" is at the same location
    And the conflict escalated to "Fighting"
    When the conflict resolves
    Then "Brother Ezekiel" should have witnessed the conflict
    And "Brother Ezekiel" should have a conflict marker
    And the relationship panel should show the conflict event

  Scenario: Taking the blow accumulates fallout
    When I raise with 2 dice
    And the NPC sees with 2 dice
    And the NPC raises with total 8
    When I see with 3 dice to take the blow
    Then fallout dice should be accumulated
    And the bidding history should show "Took the Blow"
