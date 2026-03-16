import { Vec2, Fish } from '../core/types';
import {
    FISH_MAX_SPEED,
    FISH_MIN_SPEED,
    FISH_AVOID_RADIUS,
    FISH_ALIGN_RADIUS,
    FISH_COHESION_RADIUS,
    FISH_EDGE_MARGIN,
    FISH_EDGE_FORCE,
} from '../core/constants';

// ── Vector helpers ────────────────────────────────────────────────────────────

export function add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2, s: number): Vec2 {
    return { x: v.x * s, y: v.y * s };
}

export function length(v: Vec2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vec2): Vec2 {
    const len = length(v);
    if (len < 0.0001) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}

export function limit(v: Vec2, max: number): Vec2 {
    const len = length(v);
    if (len > max) return scale(normalize(v), max);
    return { x: v.x, y: v.y };
}

export function dist(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

// ── Boid steering forces ──────────────────────────────────────────────────────

// Separation: steer away from nearby fish to avoid crowding
function separation(fish: Fish, others: Fish[]): Vec2 {
    let steer = { x: 0, y: 0 };
    let count = 0;

    for (const other of others) {
        if (other.id === fish.id) continue;
        const d = dist(fish.position, other.position);
        if (d < FISH_AVOID_RADIUS && d > 0) {
            const diff = normalize(sub(fish.position, other.position));
            // Weight by inverse distance — closer fish push harder
            steer = add(steer, scale(diff, 1 / d));
            count++;
        }
    }

    if (count > 0) {
        steer = scale(steer, 1 / count);
        steer = normalize(steer);
        steer = scale(steer, FISH_MAX_SPEED);
        steer = sub(steer, fish.velocity);
        steer = limit(steer, 0.8);
    }

    return steer;
}

// Alignment: steer toward average heading of nearby fish
function alignment(fish: Fish, others: Fish[]): Vec2 {
    let avg = { x: 0, y: 0 };
    let count = 0;

    for (const other of others) {
        if (other.id === fish.id) continue;
        if (dist(fish.position, other.position) < FISH_ALIGN_RADIUS) {
            avg = add(avg, other.velocity);
            count++;
        }
    }

    if (count > 0) {
        avg = scale(avg, 1 / count);
        avg = normalize(avg);
        avg = scale(avg, FISH_MAX_SPEED);
        const steer = sub(avg, fish.velocity);
        return limit(steer, 0.3);
    }

    return { x: 0, y: 0 };
}

// Cohesion: steer toward average position of nearby fish
function cohesion(fish: Fish, others: Fish[]): Vec2 {
    let center = { x: 0, y: 0 };
    let count  = 0;

    for (const other of others) {
        if (other.id === fish.id) continue;
        if (dist(fish.position, other.position) < FISH_COHESION_RADIUS) {
            center = add(center, other.position);
            count++;
        }
    }

    if (count > 0) {
        center = scale(center, 1 / count);
        const desired = normalize(sub(center, fish.position));
        const steer   = sub(scale(desired, FISH_MAX_SPEED), fish.velocity);
        return limit(steer, 0.25);
    }

    return { x: 0, y: 0 };
}

// Edge avoidance: push fish back toward screen when near edges
function edgeForce(fish: Fish, screenW: number, screenH: number): Vec2 {
    let force = { x: 0, y: 0 };

    if (fish.position.x < FISH_EDGE_MARGIN) {
        force.x += FISH_EDGE_FORCE * (1 - fish.position.x / FISH_EDGE_MARGIN);
    }
    if (fish.position.x > screenW - FISH_EDGE_MARGIN) {
        force.x -= FISH_EDGE_FORCE * (1 - (screenW - fish.position.x) / FISH_EDGE_MARGIN);
    }
    if (fish.position.y < FISH_EDGE_MARGIN) {
        force.y += FISH_EDGE_FORCE * (1 - fish.position.y / FISH_EDGE_MARGIN);
    }
    if (fish.position.y > screenH - FISH_EDGE_MARGIN) {
        force.y -= FISH_EDGE_FORCE * (1 - (screenH - fish.position.y) / FISH_EDGE_MARGIN);
    }

    return force;
}

// Mouse fright: fish scatter away from cursor when nearby
function mouseAvoid(fish: Fish, mouse: Vec2 | null, radius: number): Vec2 {
    if (!mouse) return { x: 0, y: 0 };

    const d = dist(fish.position, mouse);
    if (d > radius || d < 0.001) return { x: 0, y: 0 };

    const t     = 1 - d / radius;
    const away  = normalize(sub(fish.position, mouse));
    return scale(away, t * t * FISH_MAX_SPEED * 1.8);
}

// ── Main fish update ──────────────────────────────────────────────────────────

export function updateFish(
    fish:    Fish,
    others:  Fish[],
    dt:      number,
    screenW: number,
    screenH: number,
    mouse:   Vec2 | null,
    mouseRadius: number,
): void {
    const sep   = scale(separation(fish, others), 1.6);
    const ali   = scale(alignment(fish, others),  1.0);
    const coh   = scale(cohesion(fish, others),   0.8);
    const edge  = edgeForce(fish, screenW, screenH);
    const scare = mouseAvoid(fish, mouse, mouseRadius);

    // Accumulate steering forces
    let accel = { x: 0, y: 0 };
    accel = add(accel, sep);
    accel = add(accel, ali);
    accel = add(accel, coh);
    accel = add(accel, scale(edge, dt));
    accel = add(accel, scale(scare, dt));

    fish.velocity = add(fish.velocity, scale(accel, dt));

    // Clamp to speed range — fish always keep swimming
    const spd = length(fish.velocity);
    if (spd < FISH_MIN_SPEED) {
        fish.velocity = scale(normalize(fish.velocity), FISH_MIN_SPEED);
    }
    fish.velocity = limit(fish.velocity, FISH_MAX_SPEED);

    // Update position
    fish.position = add(fish.position, scale(fish.velocity, dt));

    // Update sprite flip based on horizontal direction
    if (Math.abs(fish.velocity.x) > 5) {
        fish.flipX = fish.velocity.x < 0;
    }

    // Advance wiggle animation
    fish.wigglePhase += fish.wiggleSpeed * dt;

    // Fade in opacity
    fish.opacity = Math.min(1, fish.opacity + dt * 0.5);
}

// ── Bubble update ─────────────────────────────────────────────────────────────

export function updateBubble(
    bubble: import('../core/types').Bubble,
    dt:     number,
    screenH: number,
): void {
    // Rise upward
    bubble.position.y -= bubble.velocity.y * dt;

    // Sine wobble on x axis
    bubble.wobblePhase += bubble.wobbleSpeed * dt;
    bubble.position.x  += Math.sin(bubble.wobblePhase) * bubble.wobbleAmp * dt;

    // Pop when reaching the top
    if (bubble.position.y < -bubble.radius * 2) {
        bubble.popping    = true;
    }

    if (bubble.popping) {
        bubble.popProgress += dt * 3.5;
        bubble.opacity      = Math.max(0, 1 - bubble.popProgress);
    }
}