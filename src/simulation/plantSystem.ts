import { Plant } from '../core/types';
import {
    PLANT_COUNT,
    PLANT_MIN_SEGMENTS,
    PLANT_MAX_SEGMENTS,
    PLANT_SEGMENT_LEN,
} from '../core/constants';
import { PALETTE } from '../core/config';

let _id = 0;

function spawnPlant(screenW: number, screenH: number): Plant {
    const segmentCount = PLANT_MIN_SEGMENTS
        + Math.floor(Math.random() * (PLANT_MAX_SEGMENTS - PLANT_MIN_SEGMENTS + 1));

    const colorIndex = Math.floor(Math.random() * PALETTE.plantColors.length);

    return {
        id:            _id++,
        x:             40 + Math.random() * (screenW - 80),
        segmentCount,
        segmentLength: PLANT_SEGMENT_LEN * (0.8 + Math.random() * 0.4),
        swayPhase:     Math.random() * Math.PI * 2,
        swaySpeed:     0.4 + Math.random() * 0.6,
        swayAmp:       18 + Math.random() * 28,
        color:         PALETTE.plantColors[colorIndex],
        width:         3 + Math.random() * 4,
    };
}

export class PlantSystem {
    private plants: Plant[] = [];
    private screenW = window.innerWidth;
    private screenH = window.innerHeight;

    constructor() {
        this._spawn();
    }

    private _spawn(): void {
        for (let i = 0; i < PLANT_COUNT; i++) {
            this.plants.push(spawnPlant(this.screenW, this.screenH));
        }
    }

    resize(w: number, h: number): void {
        this.screenW = w;
        this.screenH = h;
        // Respawn plants so they redistribute along the new screen width
        this.plants = [];
        this._spawn();
    }

    update(dt: number): void {
        for (const p of this.plants) {
            p.swayPhase += p.swaySpeed * dt;
        }
    }

    getAll(): Plant[] {
        return this.plants;
    }
}