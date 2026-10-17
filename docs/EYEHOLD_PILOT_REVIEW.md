# Reviewable pilot: release readiness evidence report

Status: prototype for owner review. No customer, sale, market validation,
production deployment, certification or revenue is claimed.

The live handoff succeeded in GitHub run 39055108872 on source 5400b28.
Raven produced 4,881 characters, Deepforge produced 2,949, and the test passed
Raven's research to Deepforge. Both worker records ended `done`. Separate
artifacts are retained in that run. This proves execution and transport.

Content review found reasons to revise before a customer sees those drafts:
Raven's demand assertions have no independently checked citations; Deepforge's
"within seconds" and broad compliance language are not acceptance evidence.
Neither draft establishes buyer willingness to pay. Do not approve either
automatically or advertise those statements as verified.

The concrete prototype is `scripts/eyehold-release-readiness.cjs`. It evaluates
an imported evidence JSON locally and emits a reproducible report. It makes no
network calls and cannot deploy, charge, register an account or contact anyone.

Acceptance criteria for this bounded pilot:

| Input or check | Passing threshold |
| --- | --- |
| Release identity | Exact 40-character commit and 64-character artifact SHA256 |
| Evidence time | Within 24 hours, at most five minutes ahead |
| Required checks | One passing row each: unit, integration, security-smoke, rollback-drill |
| Evidence references | Nonempty reference for every required check |
| Health measurements | 100–10,000 valid samples; zero errors; p95 latency at most 500 ms |
| Missing, failing or ambiguous evidence | HOLD with explicit reasons |
| All imported checks pass | READY_FOR_OWNER_REVIEW, never an automatic deployment |

These thresholds are the prototype's explicit policy, not a universal production
SLA. The report does not authenticate imported evidence. A reviewer must inspect
the referenced CI logs, artifact identity, rollback drill and measurement
collection method before accepting a customer-specific result.

Input shape:

```json
{
  "release": {"commit": "<40 lowercase hex characters>", "artifactSha256": "<64 lowercase hex characters>"},
  "capturedAt": "<ISO timestamp>",
  "checks": [
    {"id": "unit", "status": "pass", "evidenceRef": "<CI run reference>"},
    {"id": "integration", "status": "pass", "evidenceRef": "<CI run reference>"},
    {"id": "security-smoke", "status": "pass", "evidenceRef": "<test reference>"},
    {"id": "rollback-drill", "status": "pass", "evidenceRef": "<drill reference>"}
  ],
  "healthSamples": [{"ok": true, "latencyMs": 50}]
}
```

The example shows one sample for brevity and intentionally fails the minimum
sample requirement. Supply real measurements to run a real report:

```sh
node scripts/eyehold-release-readiness.cjs evidence.json
```

Price, labor hours, hosting, model usage, support allowance, refunds, fees and
buyer demand remain unknown. For a proposed fixed fee, calculate contribution
as price minus measured delivery costs, provider costs, fees and support reserve.
Do not invent inputs or confuse contribution with independently reconciled profit.

Next commercial decision: the owner reviews the prototype, chooses one target
customer and delivery scope, and approves a price and contact destination before
any outreach, account registration, publishing or charge. No integration has
been linked, no credential requested and no external action queued by this pilot.
The existing permission system remains in force; the external-account policy
catalog alone is not an execution or authorization mechanism.
