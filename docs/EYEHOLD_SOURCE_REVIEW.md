# Eyehold source and claims review — 2026-10-17

Reviewed source: `2bddc6e25f5b28de5d5e5658cf7ff784250ce0cb`.
Review performed by Codex through source inspection and the recorded tests.
This is a source inventory renewal, not owner approval or release certification.

The comparison against the prior source manifest found fourteen new Eyehold
frontend modules and changes to Build Mode, specialties, remote settings,
updates, World, WorldModel and the main HTML. The review covered their data
paths and user-facing claims:

- Pixel grids and floor motifs are code-defined cosmetics. Territory and
  faction metadata grant no tools or execution authority.
- Room changes use canonical WorldModel mutation, persistence and undo paths.
  Installation protects multi-room layouts and requires a backup and explicit
  confirmation. Staffing uses existing summon, desk and roster paths.
- The Work Board reads actual backend records. The serial task composer prepares
  a request for explicit submission; it does not launch work itself. Output is
  rendered as text. Completion is distinct from owner acceptance.
- Owner acceptance checks a separate locally provisioned credential, the exact
  recorded output and the current goal digest. Crowns are internal points and
  do not authorize execution or represent currency. Real owner provisioning
  and acceptance in the user's installation remain pending.
- Treasury displays owner-reviewed imported records with an explicit scope.
  Missing evidence remains unavailable. Tests prove cosmetic marker persistence;
  they do not verify bank reconciliation, complete costs or real profit.
- Fantasy milestone decorations are explicitly planned descriptions. The installed
  marker types are existing plants, shelves and vaults, not new fantasy artwork.
- Eyehold auto-updates and manual release links are disabled. The inherited
  signed-update claim is refuted for this fork until an owned channel exists.
- Remote access copy requires configuring and verifying the owner's relay; this
  review does not certify a production relay or third-party account integrations.

The finite inventory adds three Eyehold claim families with qualified PARTIAL
verdicts. Existing unresolved claims and live-proof requirements remain open.
No claim was promoted to SHIPPED/PROVEN to make the gate pass. The canonical
`buildReleaseSurface` generates the exact tracked-source inventory from the
reviewed commit; discovery and hash enforcement remain intact.

Evidence: GitHub live handoff run `39055108872`; completed Eyehold module,
browser, eval and secret-history gates on `fc0787f5`; local actual sidecar and
browser owner-review tests; bounded chain/cron/night-shift tests including a
hung loopback-provider cancellation; real workflow-record restart proof; pilot
readiness threshold tests; generated installer asset hash verification.

Public distribution remains BLOCKED. The wider runtime/promotional asset audit,
owned code-signing and update channel, installed platform lifecycle proofs and
unresolved product claims are not certified by this source inventory renewal.
