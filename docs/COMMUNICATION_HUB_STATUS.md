# Communication Hub implementation status

## Current implementation

The existing PHP/MySQL messaging tables are reused. Course and study-group conversations continue to use `sl_conversations`, `sl_conversation_members`, `sl_messages`, attachment, reaction, notification, and report tables. The legacy `student_messages` records remain in place.

The current code changes allow students, lecturers, and administrators to open the Communication Hub. Any active university account can start a direct conversation with another active university account. Conversation history and attachment downloads remain restricted to conversation members by server-side checks. The legacy Inbox send action uses the same active-account rule. Class and group chat memberships are reconciled when a user opens the hub, including removing stale membership after an enrolment or group membership ends.

Messages can be replied to. The hub displays an English or Russian notice explaining that content is available only to conversation members through the app, while authorised system operators can read messages and files stored on the server. The notice says end-to-end encryption is not enabled.

## Encryption status

End-to-end encryption is not implemented. Current message bodies and attachments are stored in a form the application server can read. The application has no device identity key flow, authenticated key exchange, session ratchet, group key management, device verification, encrypted attachment format, or recovery and revocation process. Do not describe these messages as private from system operators or as E2EE.

The next safe design step is a separate client encryption layer built on a maintained, established protocol implementation. Signal publishes the [PQXDH](https://signal.org/docs/specifications/pqxdh/) and [Double Ratchet](https://signal.org/docs/specifications/doubleratchet/) specifications, and its [`libsignal` project](https://github.com/signalapp/libsignal) exposes client libraries. The StudentLife integration still needs a compatibility, licensing, threat-model, and security review before selecting a library. The PHP server would store and deliver opaque ciphertext and public key material only. Client devices would retain private identity and session keys. Announcements and academic enquiries would remain separate server-readable services with stated access and retention rules.

Before enabling E2EE, implementation and review must cover multi-device identity, key changes, prekey replenishment, verified safety numbers or equivalent, forward secrecy, secure group membership changes, encrypted attachments, device revocation, backup/recovery trade-offs, and server-side ciphertext-only tests. No E2EE claim should be shown before an independent review verifies the complete workflow.

## Not yet implemented in the Communication Hub

- Official announcement composition, targeting, scheduling, expiry, and read confirmations inside the hub. Existing announcements remain in the separate announcements area.
- A case-based academic enquiry workflow with categories, staff assignment, statuses, attachments, and status notifications.
- Conversation archive, pinning, message requests, blocking, typing indicators, and delivery/read indicators for individual messages.
- Course group administration, polls, group announcements, and faculty or department groups beyond existing study groups and course chats.
- Voice messages, calls, video, meetings, and screen sharing.
- Communication-wide browser notification controls, quiet hours, and privacy settings.

The current request has not been deployed. Local PHP syntax and database-backed role tests could not be run in this environment because PHP, Docker, and WSL are unavailable. `git diff --check` passed.
