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
| Phase 4: install trusted acceptance adapter into running sidecar event bus | Trusted event-bus wiring module and integration tests committed; `sidecar/index.js` installation unverified pending hook inspection | PENDING HOST INSTALL |
| Full end-to-end: live delegation, accepted evidence, one Crown award, restart persistence | Not yet run | PENDING |
| Production: unattended jobs, spending controls, revenue accounting | No production/financial proof | PENDING |
| Release fast-gate source-lock | Protected claim inventory drift is unresolved; do not weaken | BLOCKED |

## Next actions in order
1. **Completed:** Phase 4 isolated backend verification passed on GitHub Actions, as reported by the operator; the stale ledger fixture was corrected in commit `afc9c46a6e26ebdfc5003f73261cb63918f72b01`.
2. Run **Eyehold Phase 4 - Goal-aligned Crown verification** again for the new event-bus lifecycle test, and **Eyehold Phase 4 - Production hook inspection** for safe event/store locator evidence. Then install `sidecar/eyehold-crown-integration.js` into the actual sidecar startup with authoritative records. Do not emit awards from frontend UI/animation or from `agent.run.end` alone.
3. **Completed:** the operator reported a green **Eyehold Phase 3 - Live Eye to Deepforge proof** on `feat/harness-backend`. Keep the positive live result separate from the still-unverified automated Crown integration.
4. Execute the full **live delegation -> accepted business milestone -> durable Crown award -> supervisor report** acceptance proof.
5. Define customer-facing, lawful sales/service workflows and separately account for real payments, refunds, operating expenses and model spend.
6. Repair/review the original release claim lock as part of formal release validation, retaining its integrity.

Never report a new phase as completed based solely on committed code. Phase 4's test fixtures are independent of the live server until its startup/event-store seams are verified.
