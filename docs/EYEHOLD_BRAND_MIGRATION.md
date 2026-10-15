# The Eyehold — Brand Migration Ledger
Date: 2026-10-15
Status: PARTIAL. Do not release commercially.

## Changes committed
- `frontend/index.html`: primary tab title, splash, boot/recovery labels, and visible logo locations now use the Eyehold text identity. The StarNet image on the first-run splash was removed, but other branded image surfaces may remain.
- `src-tauri/tauri.conf.json`: desktop productName set to The Eyehold.
- Fantasy room metadata/build selector and first Keep floor prototype already committed in previous work.

## Explicit unresolved critical areas
1. **Payments, account linking, and subscription navigation** — app still contains StarNet account/subscription copy, IDs, and links, including `https://www.starnetos.com/pricing`. Do NOT merely relabel the old billing integration. Disable/hide it before public distribution or replace it with your own tested backend and Stripe products.
2. **Desktop updater** — `src-tauri/tauri.conf.json` still points to the original `androoAGI/starnet-releases` update feed and includes an upstream signature key. Never ship a branded production client configured to install upstream updates. Configure your independent signed updater and release host before any distributed build.
3. **Publisher/signing** — bundle publisher currently says Andrew Sims. Replace with the user's actual legal publisher once set up; cannot invent signing identity or certificates.
4. **Bundle application identifier, state/keychain namespace, save schema, and local persistence** — old internal `starnet` / `skynet` strings may be compatibility-sensitive. Decide migration strategy and test round-trips before altering.
5. **Runtime UI labels** — hard-coded dynamically rendered text in `frontend/app/*.js`, CSS art/wordmarks, HTML hints, notifications, remote UI, installation screens, browser titles and website remain to audit and replace.
6. **Brand art/assets** — original artwork, sprite sheets, icons, installer banners and promotional illustrations are expressly excluded from the code's MIT grant per upstream README. Audit provenance and replace.
7. **Docs** — original README/NOTICE/LICENSE and upstream documentation may refer to StarNet. Preserve original copyright and license notices for attribution; distinguish historical provenance from user-facing product brand. Write an independent README rather than deleting attribution.
8. **Release metadata** — package name/lockfile, Cargo crate/lockfile, version sync, workflows, releases URLs and manifests must be coordinated and built/tested, not string-replaced globally.

## Exit criteria for fully rebranded product
No live user-facing upstream brand, outbound monetization, updater, app install metadata, or reserved visual assets. Preserve upstream legal notices, compatibility as necessary; pass search audit, test:fast/test:http/release checks, signed Windows and notarized Mac checks, real install/update/billing tests.

## Current status
This document and the commits are not evidence of a successfully running or shippable product. No local build or tests ran here.
