export interface Vec2 {
    x: number;
    y: number;
}

export type FishSpecies = 'clownfish' | 'angelfish' | 'tang' | 'tetra' | 'guppy';

export interface Fish {
    id: number;
    position: Vec2;
    velocity: Vec2;
    species: FishSpecies;
    scale: number;           // size multiplier, varies per individual
    flipX: boolean;          // mirror sprite when swimming left
    wigglePhase: number;     // current phase of body wiggle animation
    wiggleSpeed: number;     // how fast this fish wiggles
    wiggleAmp: number;       // how much this fish wiggles
    opacity: number;         // for fade in/out
    depth: number;           // 0 (back) to 1 (front) — affects scale + opacity
}

export interface Bubble {
    id: number;
    position: Vec2;
    velocity: Vec2;
    radius: number;
    wobblePhase: number;     // horizontal sine wobble
    wobbleSpeed: number;
    wobbleAmp: number;
    opacity: number;
    popping: boolean;        // true when bubble has reached surface
    popProgress: number;     // 0→1 pop animation progress
}

export interface Plant {
    id: number;
    x: number;               // screen x anchor at bottom edge
    segmentCount: number;    // number of bezier segments stacked
    segmentLength: number;   // pixel length of each segment
    swayPhase: number;       // current sway phase
    swaySpeed: number;
    swayAmp: number;         // max pixel deflection at tip
    color: string;           // css color string
    width: number;           // stem width at base
}

export interface Particle {
    id: number;
    position: Vec2;
    velocity: Vec2;
    radius: number;
    opacity: number;
    life: number;            // remaining lifetime in seconds
    lifeTotal: number;
    color: string;
}
