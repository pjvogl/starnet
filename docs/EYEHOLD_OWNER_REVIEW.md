# Owner review and Crowns

The Work Board now offers explicit acceptance of a completed run against the
active business goal. The standard app token alone cannot approve work.

On the computer running the sidecar, provision separate owner authority once:

```sh
node scripts/eyehold-owner-key.cjs --workspace-root /absolute/path/to/your/workspaces
```

Use the sidecar's actual workspace root, not the repository or an agent folder.
The command displays a random key once. Keep it privately; do not give it to an
agent or paste it into chat. The server stores only its hash under `.secrets`.
Existing owner authority cannot be silently overwritten. Provisioning is local;
there is no HTTP key setup or key retrieval route. Restart is unnecessary.

Open WORK BOARD, select a completed run, inspect its recorded output and displayed
goal, choose quality, confirm goal progress and enter the owner key. The form
clears the key after submission. Acceptance binds the exact output digest and
goal wording. Reopen the record after changing either. A completed run without
recorded output or an active goal cannot be accepted.

The server records reviewer identity, timestamp, goal text and evidence digests.
It assigns one contributor from the real run, complexity one and no test bonus.
Human acceptance is labelled `user`; it does not assert independently passed
tests. Each run can be awarded once. Acceptance and Crown totals persist, and
restart reconciliation recovers an interrupted award without double credit.

Crowns are internal productivity points. They do not establish revenue, net
profit, permission to spend or permission to operate external accounts.

The application follows its existing single-user loopback trust boundary. A
compromised process running as the same OS user can modify app files; this is not
an OS isolation system. Run agent workloads in the supported sandbox where
strong isolation is required. No real owner authority is provisioned by CI and
no real output is automatically accepted by the test fixtures.

Validation: `test/eyehold-owner-service.test.js` exercises the mounted HTTP
handler and multiple actual sidecar restarts. `scripts/qa/eyehold-ui-smoke.cjs`
tests wrong-key rejection, explicit fixture acceptance and key clearing through
the real browser UI. No provider calls are made by either proof.
