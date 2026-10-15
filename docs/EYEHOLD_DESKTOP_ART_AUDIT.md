# Eyehold desktop asset provenance audit
Date: 2026-10-15
Status: **BLOCKED for distribution**; source inspection, not a license clearance.

## Installer and application assets still selected by Tauri
The following files are present in the fork. They have NOT been replaced with
independently licensed Eyehold artwork, and no rights to redistribute their
original StarNet designs are established by the upstream MIT source license.

- `src-tauri/icons/32x32.png`
- `src-tauri/icons/128x128.png`
- `src-tauri/icons/128x128@2x.png`
- `src-tauri/icons/icon.icns`
- `src-tauri/icons/icon.ico`
- `src-tauri/installer/header.bmp`
- `src-tauri/installer/sidebar.bmp`
- `src-tauri/installer/dmg-background.png`

The first, ICO, and installer image files were confirmed present in repository.
This list also comes from `src-tauri/tauri.conf.json`. Other runtime art,
website/promotional imagery and `frontend/assets` still require a complete audit.

## Safety constraints
Do not ship these original visual assets under the Eyehold brand without rights.
Do not delete icon entries and substitute broken installer paths.
Do not invent a publisher or code-signing identity.
Do not remove original MIT/NOTICE attributions.
Do not treat the presence of source file hashes as evidence of art licensing.

## Replacement workflow
1. Create original Eyehold logo and source artwork with recorded provenance.
2. Produce each exact asset size/file format using a reproducible asset pipeline.
3. Replace all Tauri-referenced binary images in a dedicated reviewed commit.
4. Verify sizes, color depth, transparency, crop and installer layout on Windows.
5. Audit old asset references in the frontend and website.
6. Run both Eyehold unit tests and upstream fast/http/release checks.
7. Review copyright/attribution and establish independent publisher/signing keys.
