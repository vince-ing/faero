// ── Fish ─────────────────────────────────────────────────────────────────────
export const FISH_COUNT          = 12;
export const FISH_MAX_SPEED      = 120;
export const FISH_MIN_SPEED      = 40;
export const FISH_AVOID_RADIUS   = 80;
export const FISH_ALIGN_RADIUS   = 150;
export const FISH_COHESION_RADIUS = 200;
export const FISH_EDGE_MARGIN    = 100;
export const FISH_EDGE_FORCE     = 200;

// ── Bubbles ──────────────────────────────────────────────────────────────────
// BUBBLE_AMOUNT: master control 0.0 = none, 1.0 = maximum
export const BUBBLE_AMOUNT = 0.2;

// Size distribution — which size tiers appear.
// Each is 0.0–1.0: lower = fewer of that size, 0.0 = none of that size.
export const BUBBLE_SIZE_LARGE  = 1.0;  // big bubbles  (grid 2.0)
export const BUBBLE_SIZE_MEDIUM = 0.5;  // medium        (grid 3.0)
export const BUBBLE_SIZE_SMALL  = 0.3;  // small         (grid 4.0)
export const BUBBLE_SIZE_TINY   = 0.3;  // tiny          (grid 7.0)
export const BUBBLE_SIZE_MICRO  = 0.3;  // micro         (grid 9.2)
export const BUBBLE_SIZE_NANO   = 0.5;  // nano          (grid 14.2)

// ── Particles ────────────────────────────────────────────────────────────────
export const PARTICLE_MAX        = 120;

// ── Caustics ─────────────────────────────────────────────────────────────────
export const CAUSTIC_STRENGTH    = 0.35;
export const CAUSTIC_SPEED       = 0.6;

// ── Glow ─────────────────────────────────────────────────────────────────────
export const GLOW_RADIUS_MULT    = 3.5;
export const GLOW_ALPHA          = 0.18;

// ── Depth ────────────────────────────────────────────────────────────────────
export const DEPTH_SCALE_MIN     = 0.55;
export const DEPTH_SCALE_MAX     = 1.0;
export const DEPTH_OPACITY_MIN   = 0.45;
export const DEPTH_OPACITY_MAX   = 1.0;