/* THE EYEHOLD — additive, presentation-only territory registry.
 * Canonical rooms, capability grants, routes, and agent authority remain in WorldModel/sidecar.
 * No room cap: rooms keyed by stable IDs, including multiple rooms of the same faction.
 */
'use strict';
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EyeholdTerritories = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  const ENVIRONMENTS = Object.freeze({
    keep: Object.freeze({ label: "The Eye's Keep", factionId: 'sovereign', assetSetId: 'keep-v1' }),
    foundry: Object.freeze({ label: 'War Foundry', factionId: 'iron-host', assetSetId: 'foundry-v1' }),
    moonleaf: Object.freeze({ label: 'Moonleaf Hall', factionId: 'silver-bough', assetSetId: 'moonleaf-v1' }),
    forge: Object.freeze({ label: 'Stone Forge', factionId: 'deepforge', assetSetId: 'forge-v1' }),
    archive: Object.freeze({ label: 'Black Archive', factionId: 'raven-court', assetSetId: 'archive-v1' }),
    roost: Object.freeze({ label: 'Signal Roost', factionId: 'cinder-messengers', assetSetId: 'roost-v1' }),
    astral: Object.freeze({ label: 'Astral Tower', factionId: 'star-sages', assetSetId: 'astral-v1' }),
    generic: Object.freeze({ label: 'New Territory', factionId: 'unassigned', assetSetId: 'generic-v1' })
  });
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const str = (s, fallback, max) => typeof s === 'string' && s.trim() ? s.trim().slice(0, max || 80) : fallback;
  const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value);
  function normalizeRoom(roomId, spec, catalog) {
    if (!safeId(roomId)) throw new TypeError('Invalid room ID');
    if (spec == null || typeof spec !== 'object' || Array.isArray(spec)) spec = {};
    const envId = str(spec.environmentId, 'generic', 64);
    const environmentId = own(catalog, envId) ? envId : 'generic';
    const base = catalog[environmentId];
    return {
      displayName: str(spec.displayName, base.label, 80),
      environmentId,
      factionId: str(spec.factionId, base.factionId, 64),
      assetSetId: str(spec.assetSetId, base.assetSetId, 128)
    };
  }
  function normalize(input, extraEnvironments) {
    const catalog = Object.assign(Object.create(null), ENVIRONMENTS);
    if (extraEnvironments && typeof extraEnvironments === 'object') {
      for (const [key, val] of Object.entries(extraEnvironments)) {
        if (!safeId(key) || !val || typeof val !== 'object' || Array.isArray(val)) continue;
        catalog[key] = {
          label: str(val.label, 'New Territory', 80),
          factionId: str(val.factionId, 'unassigned', 64),
          assetSetId: str(val.assetSetId, 'generic-v1', 128)
        };
      }
    }
    const rooms = Object.create(null);
    const inputRooms = input && typeof input === 'object' && input.rooms && typeof input.rooms === 'object' && !Array.isArray(input.rooms) ? input.rooms : {};
    for (const [id, spec] of Object.entries(inputRooms)) {
      if (!safeId(id)) continue;
      rooms[id] = normalizeRoom(id, spec, catalog);
    }
    return { schemaVersion: VERSION, worldTheme: 'eyehold', rooms };
  }
  function assign(input, roomId, patch, extraEnvironments) {
    if (!safeId(roomId)) throw new TypeError('Invalid room ID');
    const state = normalize(input, extraEnvironments);
    const old = own(state.rooms, roomId) ? state.rooms[roomId] : {};
    state.rooms[roomId] = normalizeRoom(roomId, Object.assign({}, old, patch || {}), Object.assign(Object.create(null), ENVIRONMENTS, extraEnvironments || {}));
    return state;
  }
  function remove(input, roomId, extraEnvironments) {
    const state = normalize(input, extraEnvironments);
    if (safeId(roomId)) delete state.rooms[roomId];
    return state;
  }
  function resolve(input, roomId, extraEnvironments) {
    const state = normalize(input, extraEnvironments);
    return own(state.rooms, roomId) ? state.rooms[roomId] : normalizeRoom(safeId(roomId) ? roomId : 'unnamed', {}, Object.assign(Object.create(null), ENVIRONMENTS));
  }
  return Object.freeze({ VERSION, ENVIRONMENTS, normalize, assign, remove, resolve });
});
