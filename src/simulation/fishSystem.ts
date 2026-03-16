import { Fish, FishSpecies } from '../core/types';
import { updateFish, Vec2 } from './physics';
import {
    FISH_COUNT,
    FISH_MIN_SPEED,
    FISH_MAX_SPEED,
    DEPTH_SCALE_MIN,
    DEPTH_SCALE_MAX,
    DEPTH_OPACITY_MIN,
    DEPTH_OPACITY_MAX,
} from '../core/constants';
import { FISH_SPAWN_WEIGHTS } from '../core/config';

let _id = 0;

const SPECIES = Object.keys(FISH_SPAWN_WEIGHTS) as FishSpecies[];

function weightedRandomSpecies(): FishSpecies {
    const total = SPECIES.reduce((s, sp) => s + FISH_SPAWN_WEIGHTS[sp], 0);
    let r = Math.random() * total;
    for (const sp of SPECIES) {
        r -= FISH_SPAWN_WEIGHTS[sp];
        if (r <= 0) return sp;
    }
    return SPECIES[0];
}

function spawnFish(screenW: number, screenH: number): Fish {
    const species = weightedRandomSpecies();
    const depth   = Math.random();
    const depthScale = DEPTH_SCALE_MIN + depth * (DEPTH_SCALE_MAX - DEPTH_SCALE_MIN);

    // Spawn at a random screen position
    const x = Math.random() * screenW;
    const y = Math.random() * screenH;

    // Random initial velocity within speed range
    const angle = Math.random() * Math.PI * 2;
    const speed = FISH_MIN_SPEED + Math.random() * (FISH_MAX_SPEED - FISH_MIN_SPEED) * 0.5;

    return {
        id:          _id++,
        position:    { x, y },
        velocity:    { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        species,
        scale:       depthScale * (0.85 + Math.random() * 0.3),
        flipX:       Math.random() < 0.5,
        wigglePhase: Math.random() * Math.PI * 2,
        wiggleSpeed: 3.5 + Math.random() * 2.5,
        wiggleAmp:   0.6 + Math.random() * 0.4,
        opacity:     0,   // fade in from 0
        depth,
    };
}

export class FishSystem {
    private fish: Fish[] = [];
    private screenW = window.innerWidth;
    private screenH = window.innerHeight;

    constructor() {
        this._spawn();
    }

    private _spawn(): void {
        for (let i = 0; i < FISH_COUNT; i++) {
            this.fish.push(spawnFish(this.screenW, this.screenH));
        }
    }

    resize(w: number, h: number): void {
        this.screenW = w;
        this.screenH = h;
    }

    update(dt: number, mouse: Vec2 | null, mouseRadius: number): void {
        for (const f of this.fish) {
            updateFish(f, this.fish, dt, this.screenW, this.screenH, mouse, mouseRadius);

            // Recalculate depth-driven opacity each frame
            const depthOpacity = DEPTH_OPACITY_MIN + f.depth * (DEPTH_OPACITY_MAX - DEPTH_OPACITY_MIN);
            // Multiply by fade-in opacity (starts at 0, ramps to 1)
            f.opacity = Math.min(f.opacity, depthOpacity);
        }
    }

    // Return fish sorted back-to-front for correct painter's order
    getSorted(): Fish[] {
        return [...this.fish].sort((a, b) => a.depth - b.depth);
    }

    getAll(): Fish[] {
        return this.fish;
    }
}