import { FishSpecies } from './types';

// ── Frutiger Aero palette ────────────────────────────────────────────────────
export const PALETTE = {
    waterTint:    'rgba(0, 80, 160, 0.08)',   // subtle blue wash over whole screen
    causticColor: '#a8dfff',                   // light blue-white caustic ripples
    glowCyan:     '#00eeff',
    glowAqua:     '#00ffcc',
    glowLime:     '#aaff44',
    bubbleFill:   'rgba(180, 230, 255, 0.18)',
    bubbleStroke: 'rgba(200, 240, 255, 0.7)',
    plantColors:  [
        '#2ecc71',   // emerald
        '#1abc9c',   // turquoise
        '#27ae60',   // nephritis
        '#16a085',   // green sea
        '#3ae374',   // mint
    ],
};

// ── Sprite paths ─────────────────────────────────────────────────────────────
// Keys must match FishSpecies union in types.ts
export const FISH_SPRITES: Record<FishSpecies, string> = {
    clownfish: '/sprites/fish/clownfish.png',
    angelfish: '/sprites/fish/angelfish.png',
    tang:      '/sprites/fish/tang.png',
    tetra:     '/sprites/fish/tetra.png',
    guppy:     '/sprites/fish/guppy.png',
};

export const BUBBLE_SPRITE  = '/sprites/bubbles/bubble.png';
export const SPARKLE_SPRITE = '/sprites/particles/sparkle.png';

// ── Species size config ──────────────────────────────────────────────────────
// Base render height in px at depth=1. Width scales with sprite aspect ratio.
export const FISH_BASE_HEIGHT: Record<FishSpecies, number> = {
    clownfish: 88,
    angelfish: 124,
    tang:      76,
    tetra:     86,
    guppy:     82,
};

// ── Species spawn weights ────────────────────────────────────────────────────
// Higher = more likely to be chosen when spawning a random fish
export const FISH_SPAWN_WEIGHTS: Record<FishSpecies, number> = {
    clownfish: 5,
    angelfish: 4,
    tang:      4,
    tetra:     4,
    guppy:     4,
};
