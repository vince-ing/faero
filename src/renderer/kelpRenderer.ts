// KelpRenderer — 2D canvas kelp drawn as layered tapered bezier blades

import { Vec2 } from '../core/types';

interface Blade {
    x: number;
    height: number;
    width: number;
    swayPhase: number;
    swaySpeed: number;
    swayAmp: number;
    colorA: string;
    colorB: string;
    segments: number;
    layer: number;
    lean: number;
    // Current displayed displacement (-1..1)
    mouseInfluence: number;
    curlInfluence: number;
    // Peak displacement captured when mouse pushes — drains slowly on its own
    mouseHold: number;
    curlHold: number;
}

const MOUSE_RADIUS  = 250;
const WIND_STRENGTH = 200;
const CURL_STRENGTH = 1.2;
const SPEED_SCALE   = 18;

// How fast influence chases the active push target
const LERP_IN       = 0.1;
// How fast influence chases the hold value once mouse is gone
const LERP_HOLD     = 0.03;
// How slowly the hold itself drains back to zero — this is the long drift
const HOLD_DECAY    = 0.9275; // ~0.25% per frame → takes ~10s to fully decay at 60fps

export class KelpRenderer {
    readonly canvas: HTMLCanvasElement;
    private ctx:     CanvasRenderingContext2D;
    private blades:  Blade[] = [];
    private W = 0;
    private H = 0;

    private prevMouseX: number | null = null;
    private smoothVelX = 0;

    private readonly KELP_ZONE = 0.42;

    constructor(width: number, height: number) {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 3;
        `;
        this.ctx = this.canvas.getContext('2d')!;
        this.resize(width, height);
    }

    resize(width: number, height: number): void {
        const dpr = window.devicePixelRatio || 1;
        this.W = width;
        this.H = height;
        this.canvas.width  = width * dpr;
        this.canvas.height = height * dpr;
        this.ctx.scale(dpr, dpr);
        this._spawnBlades();
    }

    private _spawnBlades(): void {
        this.blades = [];
        const zoneH = this.H * this.KELP_ZONE;

        const colorPairs: [string, string][] = [
            ['#1a4a3a', '#2a9a7a'],
            ['#1a3a4a', '#2a7a9a'],
            ['#1a4a45', '#2a8a85'],
            ['#1a3d4a', '#2a7a8a'],
            ['#1a4540', '#2a8a80'],
        ];

        const numClusters = 2 + Math.floor(Math.random() * 3);
        const clusterCenters: number[] = [];
        for (let c = 0; c < numClusters; c++) {
            clusterCenters.push((c / numClusters + Math.random() * 0.15) * this.W);
        }

        for (let layer = 0; layer <= 1; layer++) {
            for (const cx of clusterCenters) {
                const bladesInCluster = 2 + Math.floor(Math.random() * 3);
                const clusterSpread   = 60 + Math.random() * 1000;

                for (let j = 0; j < bladesInCluster; j++) {
                    const [ca, cb] = colorPairs[Math.floor(Math.random() * colorPairs.length)];
                    const offsetX  = (Math.random() + Math.random() - 1) * clusterSpread;
                    this.blades.push({
                        x:              cx + offsetX,
                        height:         zoneH * (0.35 + Math.random() * 0.7),
                        width:          layer === 0 ? 10 + Math.random() * 10 : 16 + Math.random() * 16,
                        swayPhase:      Math.random() * Math.PI * 2,
                        swaySpeed:      0.18 + Math.random() * 0.22,
                        swayAmp:        12 + Math.random() * 20,
                        colorA:         ca,
                        colorB:         cb,
                        segments:       4 + Math.floor(Math.random() * 3),
                        layer,
                        lean:           (Math.random() - 0.5) * 0.6,
                        mouseInfluence: 0,
                        curlInfluence:  0,
                        mouseHold:      0,
                        curlHold:       0,
                    });
                }
            }
        }

        this.blades.sort((a, b) => a.layer - b.layer);
    }

    render(time: number, mouse: Vec2 | null): void {
        const { ctx, W, H } = this;
        const baseY = H + 60;

        // ── Mouse velocity ────────────────────────────────────────────────────
        let rawVelX = 0;
        if (mouse !== null) {
            if (this.prevMouseX !== null) rawVelX = mouse.x - this.prevMouseX;
            this.prevMouseX = mouse.x;
        } else {
            this.prevMouseX = null;
        }

        this.smoothVelX += (rawVelX - this.smoothVelX) * 0.45;
        if (mouse === null) this.smoothVelX *= 0.85;

        const normVel = Math.max(-1, Math.min(1, this.smoothVelX / SPEED_SCALE));

        // ── Per-blade update ──────────────────────────────────────────────────
        for (const b of this.blades) {
            let proximity = 0;
            if (mouse !== null) {
                const dx = b.x - mouse.x;
                const dy = H   - mouse.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < MOUSE_RADIUS) {
                    const t = 1 - d / MOUSE_RADIUS;
                    proximity = t * t;
                }
            }

            const layerMult = b.layer === 0 ? 0.6 : 1.0;
            const active = proximity > 0.01 && Math.abs(normVel) > 0.01;

            if (active) {
                // Mouse is pushing — lerp influence toward the live target
                const targetI = normVel * proximity * layerMult;
                const targetC = Math.sign(normVel) * proximity * layerMult;
                b.mouseInfluence += (targetI - b.mouseInfluence) * LERP_IN;
                b.curlInfluence  += (targetC - b.curlInfluence)  * LERP_IN;

                // Capture the peak into the hold — only update hold if new
                // value is larger in magnitude (don't overwrite a big push
                // with a smaller one as the mouse slows)
                if (Math.abs(b.mouseInfluence) > Math.abs(b.mouseHold)) {
                    b.mouseHold = b.mouseInfluence;
                    b.curlHold  = b.curlInfluence;
                }
            } else {
                // No active push — influence lazily chases the hold value
                b.mouseInfluence += (b.mouseHold - b.mouseInfluence) * LERP_HOLD;
                b.curlInfluence  += (b.curlHold  - b.curlInfluence)  * LERP_HOLD;

                // Hold itself drains very slowly back to zero
                b.mouseHold *= HOLD_DECAY;
                b.curlHold  *= HOLD_DECAY;
            }
        }

        ctx.clearRect(0, 0, W, H);

        for (const b of this.blades) {
            const SEG = 6;
            const spineX: number[] = [];
            const spineY: number[] = [];

            for (let i = 0; i <= SEG; i++) {
                const frac      = i / SEG;
                const influence = frac * frac;

                const wx =
                    Math.sin(time * b.swaySpeed * 1.00 + b.swayPhase + frac * 2.1) * b.swayAmp * influence
                  + Math.sin(time * b.swaySpeed * 0.53 + b.swayPhase + frac * 3.7 + 1.2) * b.swayAmp * 0.55 * influence
                  + Math.sin(time * b.swaySpeed * 1.41 + b.swayPhase + frac * 1.3 + 2.4) * b.swayAmp * 0.28 * influence;
                const wy =
                    Math.sin(time * b.swaySpeed * 0.77 + b.swayPhase + frac * 4.2 + 0.8) * b.swayAmp * 0.12 * influence;

                const windX = b.mouseInfluence * WIND_STRENGTH * influence;

                spineX.push(b.x + wx + windX + b.lean * b.height * frac * 0.5);
                spineY.push(baseY - b.height * frac + wy);
            }

            // Curl: rotate upper spine around pivot
            const curlAngle = b.curlInfluence * CURL_STRENGTH;
            if (Math.abs(curlAngle) > 0.001) {
                const pivotIdx = Math.round(0.50 * SEG);
                const pivotX   = spineX[pivotIdx];
                const pivotY   = spineY[pivotIdx];
                for (let i = pivotIdx + 1; i <= SEG; i++) {
                    const t2    = (i - pivotIdx) / (SEG - pivotIdx);
                    const angle = curlAngle * t2 * t2;
                    const dx    = spineX[i] - pivotX;
                    const dy    = spineY[i] - pivotY;
                    const cos   = Math.cos(angle);
                    const sin   = Math.sin(angle);
                    spineX[i]   = pivotX + dx * cos - dy * sin;
                    spineY[i]   = pivotY + dx * sin + dy * cos;
                }
            }

            const hw = (frac: number) => {
                const peak = Math.pow(frac, 0.35) * Math.pow(1.0 - frac, 0.85) * 2.2;
                return Math.max(1.0, b.width * 0.5 * peak);
            };

            ctx.save();

            const tipX = spineX[SEG];
            const tipY = spineY[SEG];

            const grad = ctx.createLinearGradient(b.x, baseY, tipX, tipY);
            if (b.layer === 1) {
                grad.addColorStop(0,    b.colorA + 'ff');
                grad.addColorStop(0.38, b.colorA + 'ff');
                grad.addColorStop(0.70, b.colorB + 'ff');
                grad.addColorStop(1,    b.colorB + 'ff');
            } else {
                grad.addColorStop(0,    b.colorA + 'f0');
                grad.addColorStop(0.38, b.colorA + 'cc');
                grad.addColorStop(0.70, b.colorB + '99');
                grad.addColorStop(1,    b.colorB + '20');
            }

            ctx.globalAlpha = b.layer === 0 ? 0.50 : 0.6;

            const leftX:  number[] = [];
            const leftY:  number[] = [];
            const rightX: number[] = [];
            const rightY: number[] = [];

            for (let i = 0; i <= SEG; i++) {
                const prevI = Math.max(i - 1, 0);
                const nextI = Math.min(i + 1, SEG);
                const dx    = spineX[nextI] - spineX[prevI];
                const dy    = spineY[nextI] - spineY[prevI];
                const len   = Math.sqrt(dx * dx + dy * dy) || 1;
                const px    = -dy / len;
                const py    =  dx / len;
                const w     = hw(i / SEG);
                leftX.push(spineX[i]  + px * w);
                leftY.push(spineY[i]  + py * w);
                rightX.push(spineX[i] - px * w);
                rightY.push(spineY[i] - py * w);
            }

            ctx.beginPath();
            ctx.moveTo(leftX[0], leftY[0]);
            for (let i = 0; i < SEG; i++) {
                const mx = (leftX[i] + leftX[i + 1]) / 2;
                const my = (leftY[i] + leftY[i + 1]) / 2;
                ctx.quadraticCurveTo(leftX[i], leftY[i], mx, my);
            }
            ctx.lineTo(leftX[SEG], leftY[SEG]);
            for (let i = SEG; i > 0; i--) {
                const mx = (rightX[i] + rightX[i - 1]) / 2;
                const my = (rightY[i] + rightY[i - 1]) / 2;
                ctx.quadraticCurveTo(rightX[i], rightY[i], mx, my);
            }
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            const hlGrad = ctx.createLinearGradient(b.x, baseY, tipX, tipY);
            hlGrad.addColorStop(0,    'rgba(20,80,80,0.00)');
            hlGrad.addColorStop(0.2,  'rgba(20,80,80,0.25)');
            hlGrad.addColorStop(0.65, 'rgba(30,100,90,0.35)');
            hlGrad.addColorStop(1,    'rgba(30,100,90,0.00)');

            ctx.beginPath();
            ctx.moveTo(spineX[0], spineY[0]);
            for (let i = 0; i < SEG - 1; i++) {
                const mx = (spineX[i] + spineX[i + 1]) / 2;
                const my = (spineY[i] + spineY[i + 1]) / 2;
                ctx.quadraticCurveTo(spineX[i], spineY[i], mx, my);
            }
            ctx.lineTo(spineX[SEG], spineY[SEG]);
            ctx.strokeStyle = hlGrad;
            ctx.lineWidth   = Math.max(1.5, b.width * 0.08);
            ctx.globalAlpha = b.layer === 0 ? 0.25 : 0.45;
            ctx.stroke();

            ctx.restore();
        }
    }

    dispose(): void {
        this.canvas.remove();
    }
}