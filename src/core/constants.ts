// ── Fish ─────────────────────────────────────────────────────────────────────
export const FISH_COUNT          = 12;
export const FISH_MAX_SPEED      = 120;   // px/s
export const FISH_MIN_SPEED      = 40;    // px/s
export const FISH_AVOID_RADIUS   = 80;    // px — personal space
export const FISH_ALIGN_RADIUS   = 150;   // px — neighbourhood for alignment
export const FISH_COHESION_RADIUS = 200;  // px
export const FISH_EDGE_MARGIN    = 100;   // px from screen edge before steering back
export const FISH_EDGE_FORCE     = 200;   // steering force strength at edge

// ── Bubbles ──────────────────────────────────────────────────────────────────
export const BUBBLE_COUNT        = 18;
export const BUBBLE_RISE_SPEED   = 60;    // px/s base upward velocity
export const BUBBLE_MIN_RADIUS   = 4;
export const BUBBLE_MAX_RADIUS   = 18;

// ── Plants ───────────────────────────────────────────────────────────────────
export const PLANT_COUNT         = 10;
export const PLANT_MIN_SEGMENTS  = 4;
export const PLANT_MAX_SEGMENTS  = 9;
export const PLANT_SEGMENT_LEN   = 28;   // px

// ── Particles ────────────────────────────────────────────────────────────────
export const PARTICLE_MAX        = 120;

// ── Caustics ─────────────────────────────────────────────────────────────────
export const CAUSTIC_STRENGTH    = 0.18;  // 0–1, how bright the ripples are
export const CAUSTIC_SPEED       = 0.6;   // animation speed multiplier

// ── Glow ─────────────────────────────────────────────────────────────────────
export const GLOW_RADIUS_MULT    = 3.5;   // glow radius = fish height * this
export const GLOW_ALPHA          = 0.18;

// ── Depth ────────────────────────────────────────────────────────────────────
// Fish at depth 0 are rendered smaller/dimmer (far away)
// Fish at depth 1 are rendered larger/brighter (close)
export const DEPTH_SCALE_MIN     = 0.55;
export const DEPTH_SCALE_MAX     = 1.0;
export const DEPTH_OPACITY_MIN   = 0.45;
export const DEPTH_OPACITY_MAX   = 1.0;
