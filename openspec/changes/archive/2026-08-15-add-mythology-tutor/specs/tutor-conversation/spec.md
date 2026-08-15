## Purpose

Defines how the tutor converses with a learner: grounding answers in the active pantheon's content, declining to fabricate uncovered facts, and supporting multi-turn follow-ups without persisting state across sessions.

## ADDED Requirements

### Requirement: Grounded answers

The tutor SHALL answer a learner's questions using the active pantheon's content pack as its source of truth. When the content pack covers the subject, the answer SHALL be consistent with that content.

#### Scenario: Question covered by the pack

- **WHEN** a learner asks about an entity or myth present in the active pantheon's pack
- **THEN** the tutor answers using that content, consistent with the frontmatter and prose

### Requirement: Decline to fabricate uncovered facts

When a learner asks about something not present in the active pantheon's content pack, the tutor SHALL state that the content does not cover it rather than inventing specifics. The tutor MAY suggest related topics that the pack does cover.

#### Scenario: Question outside the pack

- **WHEN** a learner asks for a specific fact that the active pantheon's pack does not contain
- **THEN** the tutor indicates the material is not covered rather than fabricating an answer, and MAY point to related covered topics

### Requirement: Multi-turn follow-ups

The tutor SHALL use the earlier messages of the current conversation as context so that follow-up questions referring to prior turns are understood.

#### Scenario: Follow-up referring to prior turn

- **WHEN** a learner asks a follow-up (e.g. "who were her children?") that depends on an entity established earlier in the same conversation
- **THEN** the tutor interprets the follow-up in light of the earlier turn and answers accordingly

### Requirement: Stateless across sessions

The tutor SHALL NOT persist conversation history or learner progress beyond the lifetime of a single conversation session. Starting a new session SHALL begin with no memory of prior sessions.

#### Scenario: New session has no prior memory

- **WHEN** a learner starts a new session after a previous one
- **THEN** the tutor has no record of the previous session's conversation
