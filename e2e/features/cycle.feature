Feature: Daily Cycle System
  As a Dog visiting a troubled town
  I want to allocate my dice to actions each day
  So that I can investigate and resolve the town's problems

  Background:
    Given I am on Day 1 at Bridal Falls

  Scenario: Starting a new day
    When I click "Start Day"
    Then I should see my dice pool
    And I should see the available actions

  Scenario: Allocating dice to an action
    Given I have started the day
    When I select a die from my pool
    And I click on the "Investigate the Chapel" action
    Then the die should be assigned to that action
    And the die should no longer appear in my pool

  Scenario: Confirming allocations
    Given I have assigned dice to actions
    When I click "Confirm Allocations"
    Then I should see the cycle summary
    And the summary should show what I accomplished

  Scenario: Completing the cycle
    Given I am viewing the cycle summary
    When I click "Continue"
    Then I should see "Night Falls"
    When I click "Next Day"
    Then I should be on Day 2
