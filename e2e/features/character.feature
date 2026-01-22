Feature: Character System
  As a Dog in the Vineyard
  I want to create and develop my character
  So that my stats, traits, and items affect gameplay

  Scenario: Character creation with point-buy
    Given I am on the game screen with no character
    When I click "Create Character"
    And I enter my character name "Brother Ezekiel"
    And I select the "well-rounded" background
    And I allocate 5 dice to Acuity
    And I allocate 4 dice to Body
    And I allocate 4 dice to Heart
    And I allocate 4 dice to Will
    And I confirm character creation
    Then I should see my character name "Brother Ezekiel" in the sidebar
    And I should see 4 stats with dice counts

  Scenario: Stats affect dice pool
    Given I have a character with known stats
    When I start a new cycle
    Then the dice pool should contain dice from my stats

  Scenario: Trait invocation during conflict
    Given I have a character with a trait
    And I am in a conflict during my raise turn
    When I invoke a trait
    Then my conflict pool should increase
    And the trait should show as used

  Scenario: Trait cannot be invoked twice
    Given I have already invoked a trait this conflict
    When I try to invoke the same trait again
    Then the invoke button should be disabled

  Scenario: Fallout creates new trait
    Given I have completed a conflict with fallout
    Then I should see a new trait with source "fallout"
    And the new trait should have a die

  Scenario: Inventory items visible after creation
    Given I have a character with starting inventory
    Then I should see "Coat" in the inventory
    And I should see "Gun" marked as a firearm
    And I should see "Book of Life" in the inventory
    And I should see "Sacred Earth" in the inventory
