## Purpose

Defines the browser chat experience and the server-side boundary that keeps the LLM provider API key private while streaming tutor responses to the learner.

## Requirements

### Requirement: Browser chat interface

The system SHALL present a web page where a learner can type messages and read the tutor's replies in a conversational transcript. Submitted messages and their replies SHALL appear in order within the session.

#### Scenario: Learner sends a message and sees a reply

- **WHEN** a learner types a question and submits it
- **THEN** the message appears in the transcript and the tutor's reply is displayed below it

### Requirement: Server-side API key

The LLM provider API key (OpenRouter) SHALL only be used server-side and SHALL never be exposed to the browser. Model calls SHALL be made from a server-side endpoint, not from client code.

#### Scenario: Key absent from client

- **WHEN** the client application is inspected (page source, network payloads sent to the client)
- **THEN** the provider API key is not present; only the server holds it

#### Scenario: Missing key is reported

- **WHEN** the server has no provider API key configured and a chat request is made
- **THEN** the endpoint returns an error indicating configuration is missing rather than failing silently

### Requirement: Streaming responses

The tutor's reply SHALL stream to the browser incrementally as it is generated, so the learner sees text appear progressively rather than only after the full reply is complete.

#### Scenario: Reply streams progressively

- **WHEN** the tutor generates a reply to a submitted message
- **THEN** the reply text appears incrementally in the transcript as it is produced
