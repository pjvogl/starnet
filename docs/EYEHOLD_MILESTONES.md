# Eyehold milestone tracker (2026-10-15)

## Primary goal
Develop a real, authorized AI-agent workforce that produces commercially valuable accepted deliverables while controlling real provider spend. The $1,000,000 after-compute-profit figure is a **long-term aspiration**, not an achieved result. Crowns are non-transferable game points, not USD or evidence of profit.

| Milestone | Evidence | Status |
| --- | --- | --- |
| Phase 1: sidecar startup, health, and roster restart | GitHub Actions Phase 1, user reported green | PASS (offline) |
| Phase 2: real sidecar run pipeline with mock provider | GitHub Actions Phase 2, user reported green | PASS (offline) |
| Phase 2: real-model UI workload | GitHub Actions Phase 2 live probe, user reported green after funding OpenRouter | PASS (live workload, role unspecified) |
| Phase 3: summon/dispatch/child-run/session transcript with mock provider | GitHub Actions Phase 3, user reported green | PASS (offline) |
| Phase 3: actual live The Eye -> Deepforge delegated deliverable | Live workflow `.github/workflows/eyehold-phase3-live-delegation.yml` user reported green after explicit engineering-session routing correction | PASS (live role-specific proof) |
| Phase 4: goal-aligned accepted-deliverable ledger and supervisor unit proofs | `.github/workflows/eyehold-phase4-crowns.yml`, user reported green after fixture correction | PASS (isolated CI) |
| Phase 4: install trusted acceptance adapter into running sidecar event bus | Composed trusted Crown runtime tests reported green; added guarded sidecar integration interface mapping workflow; host startup installation and review authorization still outstanding | PENDING HOST INSTALL |
| Full end-to-end: live delegation, accepted evidence, one Crown award, restart persistence | Not yet run | PENDING |
| Production: unattended jobs, spending controls, revenue accounting | No production/financial proof | PENDING |
| Release fast-gate source-lock | Protected claim inventory drift is unresolved; do not weaken | BLOCKED |

## October 15 progress\n- Implemented a one-owner acceptance + Crown runtime composition entrypoint with explicit trusted host readers; tests now cover its approval, award and restart path.\n- Still not installed into `sidecar/index.js`; do not imply live awards or financial income.\n\n## Next actions in order
1. **Completed:** Phase 4 isolated backend verification passed on GitHub Actions, as reported by the operator; the stale ledger fixture was corrected in commit `afc9c46a6e26ebdfc5003f73261cb63918f72b01`.
2. **Completed:** the operator reported both Phase 4 integration test and source-safe hook-inspection workflows green. **Pending:** inspection found run/transcript paths but no matching `deliverable.accepted`, acceptance-store accessor, or Crown import. Authoritative acceptance store and trusted event are implemented as a standalone module; operator reported the end-to-end module test green. Install `sidecar/eyehold-crown-integration.js` into actual sidecar startup; then verify live awards. A fail-closed static readiness workflow was added at `.github/workflows/eyehold-phase4-acceptance-readiness.yml`. Do not emit awards from frontend UI/animation or from `agent.run.end` alone.
3. **Completed:** the operator reported a green **Eyehold Phase 3 - Live Eye to Deepforge proof** on `feat/harness-backend`. Keep the positive live result separate from the still-unverified automated Crown integration.
4. Execute the full **live delegation -> accepted business milestone -> durable Crown award -> supervisor report** acceptance proof.
5. Define customer-facing, lawful sales/service workflows and separately account for real payments, refunds, operating expenses and model spend.
6. Repair/review the original release claim lock as part of formal release validation, retaining its integrity.

Never report a new phase as completed based solely on committed code. Phase 4's test fixtures are independent of the live server until its startup/event-store seams are verified.

## Production wiring mapping
The operator reported the composed Crown runtime CI green. `sidecar/index.js` is too large for the connected file reader to return its source; `.github/workflows/eyehold-phase4-integration-mapping.yml` prints bounded run/event API interface excerpts in a GitHub job summary. Review this evidence before editing live startup, and do not award Crowns simply because a run ended.

## October 15 production bootstrap attempt
- Mapped real `runStore` and channel/event integration points from production code excerpt. `runStore` uses `runId` + `reason`; added `sidecar/eyehold-runstore-adapter.js` to map them into the strict Crown verification contract.
- Added guarded bootstrap installer `scripts/eyehold-install-host-wiring.cjs` and `.github/workflows/eyehold-phase4-install-host.yml`, which can commit `sidecar/index.js` only after syntax and offline tests pass. The workflow was configured to trigger by a branch push.
- **Security:** bootstrap deliberately uses `verifyEvidence: () => false`. This installs infrastructure but will not award production Crowns until a separate reviewer-authorized business-evidence verification mechanism is implemented and tested. No automatic real financial success is claimed.
- Confirm workflow success and resulting host commit before changing the production-host milestone status.

## Operator approval milestone
- Host bootstrap was reported green; `sidecar/index.js` now has a different blob SHA from the earlier read, consistent with an installation commit. The live evidence callback remains intentionally `verifyEvidence: () => false`.
- Added `sidecar/eyehold-review-gate.js` and `test/eyehold-review-gate.test.js`: authenticated operator identity, matching run/goal/evidence and independent evidence inspection are all required. CI workflow updated; green result not yet confirmed.
- **Still pending:** bind operator identity to a real authenticated sidecar request/session, expose an owner-only review action, and invoke acceptance within the single sidecar writer. Do not expose unrestricted approval or treat simulated auth test as production authentication.

## Owner HTTP review boundary (next integration stage)
- Added `sidecar/eyehold-owner-review-http.js` with an opt-in POST handler. It requires **host-injected** `authorizeRequest(req)` and `inspectEvidence(decision,run,context)` before awarding Crowns, and never trusts an HTTP JSON `authenticated` or `actorType` claim.
- Added offline test `test/eyehold-owner-review-http.test.js`, and included it in Phase 4 Crown workflow. The header in this test is a **mock only**, not a production authentication method.
- This handler is **not yet mounted into the actual sidecar routing table**. Before mounting, inspect existing HTTP authorization guarantees and add server-owned evidence verification. Do not substitute the test stub for real auth.

## Operator-visible productive workflow (2026-10-15)
- Added `.github/workflows/eyehold-produce-deliverable.yml`: a manual assignment input is delegated through the previously proven real-model The Eye -> Deepforge path, and the worker text plus an **unapproved** review manifest are archived as a downloadable CI artifact. This is a move toward meaningful agent output, not yet a deployed application UI or commercial service.
- Existing paid live execution budget/consent boundaries are retained; workflow has not yet been reported green. No Crowns, earnings, or production acceptance implied by artifact creation.
- Next: prove this workflow with one useful assignment, then move its review and evidence controls into the authenticated running application (rather than adding isolated ledger tests). Commercial pilot only after bounded cost and review checks.
