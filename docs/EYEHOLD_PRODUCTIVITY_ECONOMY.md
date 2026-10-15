# The Eyehold — Verified Productivity & Guild Economy v0.1
Date: 2026-10-15
Status: product/engineering specification; not a running economy.

## Product law
A character is a **view of a real backend agent**, not an independent simulated worker. Every reward must be traceable to a completed, verified work outcome. Idle/walking/desk animations, token volume, attempts, task starts, and self-reported success earn **zero**.

## Three distinct accounting units
1. **Crowns**: non-transferable in-world achievement currency. No dollar representation, convertibility, cash-out, speculative value, or real-money promises.
2. **Actual run cost (USD)**: metered model/API/tool spend from authoritative backend usage records; unknown cost stays unknown, not $0.
3. **Real-world value (USD)**: only when a user or validated external integration supplies grounded revenue/savings/contract value. Never infer that 10 crowns = $10 or advertise hypothetical income as earned income.

## Verified work event / durable ledger
Append-only `work_credited` records referencing:
- unique `runId`, `taskId`, `agentId`, `eventId`, `completedAt`
- `artifactRefs[]` and/or auditable external-action receipt
- validation method: user acceptance / deterministic test / human-reviewed deliverable / externally confirmed action
- quality, priority/complexity rubric, and declared role of contributor
- measured cost when available, and revision/rejection history
- immutable idempotency key `taskId + deliverableId + acceptanceRevision + agentId`

No credit from unverified frontend events. Backend validates provenance, completion, ownership and approvals. Only the ledger drives balances.

## Initial scoring rubric (proposal, configurable before release)
- Accepted deliverable: 10 Crowns baseline.
- Documented objective test pass: +5 Crowns.
- User-assessed quality (explicit 1–5): +0 to +10 Crowns.
- Complexity declared **before work starts**: multiplier 1.0–2.0, capped.
- Revision/rework: no fresh accepted-deliverable bonus for the same artifact; optional later bonus for a materially new accepted revision.
- Duplicate completion events: 0 additional Crowns.
- Failed/unverified/cancelled tasks: 0 Crowns (but record attempts and cost).
- Team effort: one capped reward pool per accepted task, split among explicitly attributed contributing agent IDs; supervisor cannot double count subordinate work.

Use actual task success rate, acceptance/rework, elapsed time, and measured API spend as separate **performance KPIs**, not a magic single score. Report task mix and sample size so agents aren't rewarded for cherry-picking trivial tasks.

## The Eye
Earns coordination credit ONLY when it plans/delegates correctly, the delegation is actually recorded, and a downstream outcome is accepted. Credit comes from the same capped team pool, never additional inflation. The Eye does not autonomously override permissions or spending limits.

## UI design
Agent card: faction sprite, rank, Crowns balance, accepted jobs, verified success rate (with denominator), revisions, last verified artifact, spend, and current **backend-confirmed** status: queued/running/awaiting approval/failed/completed/offline/unknown.
Task details: evidence trail + actual result link and agents who contributed.
Guild leaderboard compares similar task classes, weights confidence/sample size and shows costs separately. Never depict a character as working just because an animation timer fired.

## Background execution requirements
A server-side worker and durable queue must survive client disconnects. Recovery after process restart, cancellation, approval gates, bounded retries, concurrency caps, spending caps, and audit logs are required. Offline host = no execution; reconnecting UI should display last confirmed state with timestamp, not fake live progress.

## Engineering milestones
P0: inspect current authoritative backend completion/result, spend, schedule, and worker event contracts.
P1: implement pure, testable credit calculation and validations; no UI-led credits.
P2: design append-only ledger with idempotent writes and attribution.
P3: connect backend success/acceptance signals to ledger, handle rejections/revisions.
P4: read-only productivity dashboards with confidence and cost transparency.
P5: background reliability & cloud portability; security tests.
P6: verify on desktop and paired iPhone against real agent jobs.

## Acceptance tests
1. Timer animation without backend run => zero Crowns.
2. Fake frontend completion event => zero Crowns.
3. Retry/replay duplicate event => no double credit.
4. Genuine successful deliverable, pending review => zero until acceptance.
5. Rejected artifact => zero or reversal in audit ledger, not silent deletion.
6. Two contributors including The Eye => split capped pool exactly once.
7. Failed run with billed tokens => cost recorded, no earned Crowns.
8. Restart/reconnect => balances identical; running status cannot be fabricated.
9. Real dollar revenue unknown => shown as 'not measured'.
10. Rewards remain non-transferable and cannot purchase elevated tool authority.
