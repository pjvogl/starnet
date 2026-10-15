# Eyehold milestone tracker (2026-10-15)

## Primary goal
Develop a real, authorized AI-agent workforce that produces commercially valuable accepted deliverables while controlling real provider spend. The $1,000,000 after-compute-profit figure is a **long-term aspiration**, not an achieved result. Crowns are non-transferable game points, not USD or evidence of profit.

| Milestone | Evidence | Status |
| --- | --- | --- |
| Phase 1: sidecar startup, health, and roster restart | GitHub Actions Phase 1, user reported green | PASS (offline) |
| Phase 2: real sidecar run pipeline with mock provider | GitHub Actions Phase 2, user reported green | PASS (offline) |
| Phase 2: real-model UI workload | GitHub Actions Phase 2 live probe, user reported green after funding OpenRouter | PASS (live workload, role unspecified) |
| Phase 3: summon/dispatch/child-run/session transcript with mock provider | GitHub Actions Phase 3, user reported green | PASS (offline) |
| Phase 3: actual live The Eye -> Deepforge delegated deliverable | No verified role-specific live receipt yet | PENDING |
| Phase 4: goal-aligned accepted-deliverable ledger and supervisor unit proofs | `.github/workflows/eyehold-phase4-crowns.yml`, manual run required | PENDING CI |
| Phase 4: install trusted acceptance adapter into running sidecar event bus | Adapter exists but authoritative integration not verified | PENDING |
| Full end-to-end: live delegation, accepted evidence, one Crown award, restart persistence | Not yet run | PENDING |
| Production: unattended jobs, spending controls, revenue accounting | No production/financial proof | PENDING |
| Release fast-gate source-lock | Protected claim inventory drift is unresolved; do not weaken | BLOCKED |

## Next actions in order
1. Manually run **Eyehold Phase 4 - Goal-aligned Crown verification** on `feat/harness-backend`; confirm test result and resolve genuine failures.
2. Add verified goal and acceptance records to the existing **trusted** sidecar event lifecycle. Do not emit awards from frontend UI/animation or from `agent.run.end` alone.
3. Design and run a small, capped **live Eye-to-Deepforge** delegation proof with an actual child-run transcript/deliverable.
4. Execute the full **live delegation -> accepted business milestone -> durable Crown award -> supervisor report** acceptance proof.
5. Define customer-facing, lawful sales/service workflows and separately account for real payments, refunds, operating expenses and model spend.
6. Repair/review the original release claim lock as part of formal release validation, retaining its integrity.

Never report a new phase as completed based solely on committed code. Phase 4's test fixtures are independent of the live server until its startup/event-store seams are verified.
