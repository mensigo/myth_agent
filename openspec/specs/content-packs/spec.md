## Purpose

Defines the curated, versioned content format that grounds the tutor and the contract by which new pantheons are added as drop-in packs without code changes.

## Requirements

### Requirement: Pantheon content pack structure

The system SHALL represent each pantheon as a directory `content/<pantheon>/` containing a `manifest.json` and one or more entity files. Each entity file SHALL be a markdown file with a YAML frontmatter block followed by markdown prose.

Frontmatter SHALL include at minimum the fields `id` (unique within the pantheon), `type` (e.g. `deity`, `hero`, `myth`, `place`, `concept`), and `name`. Additional structured fields (e.g. `domain`, `parents`, `consort`) MAY be present and are optional.

#### Scenario: Well-formed entity file is loaded

- **WHEN** a pantheon directory contains an entity file with valid frontmatter including `id`, `type`, and `name`, plus a prose body
- **THEN** the system loads it as an entity with those fields and its prose available as grounding content

#### Scenario: Entity missing a required field is rejected

- **WHEN** an entity file's frontmatter is missing `id`, `type`, or `name`
- **THEN** the system SHALL treat the pack as invalid and report which entity and field are missing rather than loading partial content silently

#### Scenario: Duplicate entity id within a pantheon

- **WHEN** two entity files in the same pantheon declare the same `id`
- **THEN** the system SHALL report the conflict rather than silently using one of them

### Requirement: Pantheon manifest

The system SHALL read a `manifest.json` in each pantheon directory that declares at least the pantheon's `id` and human-readable `name`. The manifest identifies the pantheon and provides display metadata.

#### Scenario: Manifest provides pantheon identity

- **WHEN** a pantheon directory contains a `manifest.json` with `id` and `name`
- **THEN** the system exposes that pantheon as available by its `id` and `name`

#### Scenario: Missing or invalid manifest

- **WHEN** a pantheon directory has no `manifest.json` or one lacking `id` or `name`
- **THEN** the system SHALL not offer that pantheon and SHALL report the reason

### Requirement: Drop-in pantheon extensibility

Adding a new pantheon SHALL require only adding a `content/<pantheon>/` directory that follows the pack structure and manifest requirements. No application code changes SHALL be required to make a validly structured new pantheon available to the tutor.

#### Scenario: New pantheon becomes available without code changes

- **WHEN** a new directory `content/<pantheon>/` is added with a valid manifest and at least one valid entity file, and the application is restarted
- **THEN** the tutor can ground answers in that pantheon's content without any code modification

### Requirement: Active pantheon loading

The system SHALL load the content of a single active pantheon and make its entities' frontmatter and prose available as grounding material for the tutor.

#### Scenario: Active pantheon content is available for grounding

- **WHEN** a pantheon is selected as active and its pack is valid
- **THEN** all of that pantheon's entities are available to the tutor as grounding content
