Feature: Town Generation
  As a Dog traveling between towns
  I want to choose from multiple procedurally generated towns
  So that each playthrough offers a different moral landscape

  Scenario: Player sees town selection screen
    Given I open the application
    Then I should see the town selection screen
    And I should see at least 3 town options
    And each town should show its name and description

  Scenario: Player selects a hand-crafted town
    Given I open the application
    When I select "Bridal Falls"
    Then the game should load with "Bridal Falls" as the town
    And I should see the town map with locations

  Scenario: Player selects a generated town
    Given I open the application
    When I select a generated town
    Then the game should load with that town
    And I should see at least 5 NPC locations on the map
    And I should be able to navigate between locations

  Scenario: Generated town has interactable NPCs
    Given I have entered a generated town
    When I navigate to a location with an NPC
    Then I should be able to start a conversation
    And the NPC should have available topics

  Scenario: Generated town sin chain is discoverable
    Given I have entered a generated town
    When I talk to NPCs about different topics
    Then I should be able to uncover at least one discovery
    And the mental map should update with the discovery

  Scenario: Multiple generated towns are different
    Given I open the application
    Then the generated towns should have different names
    And the generated towns should have different NPC counts or sin depths
