import { Fish, Plant, Particle } from '../core/types';
import { SpriteSheet } from './spriteSheet';

export class MainRenderer {
    readonly canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        this.canvas = document.createElement('canvas');
        this.canvas.width  = width;
        this.canvas.height = height;
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 4;
        `;
        this.ctx = this.canvas.getContext('2d')!;
    }

    resize(width: number, height: number): void {
        this.canvas.width  = width;
        this.canvas.height = height;
    }

    render(
        fish:      Fish[],
        plants:    Plant[],
        particles: Particle[],
        sprites:   SpriteSheet,
        screenH:   number,
    ): void {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw order: plants → particles → fish (back to front)
        this._drawPlants(plants, screenH);
        this._drawParticles(particles);
        this._drawFish(fish, sprites);
    }

    // ── Plants ────────────────────────────────────────────────────────────────

    private _drawPlants(plants: Plant[], screenH: number): void {
        const ctx = this.ctx;

        for (const p of plants) {
            ctx.save();

            const totalH = p.segmentCount * p.segmentLength;
            const baseY  = screenH;
            let tipX     = p.x;
            let tipY     = baseY;

            ctx.beginPath();
            ctx.moveTo(tipX, tipY);

            for (let i = 0; i < p.segmentCount; i++) {
                const t    = i / p.segmentCount;
                const sway = Math.sin(p.swayPhase + t * 1.8) * p.swayAmp * t;
                const nextX = p.x + sway;
                const nextY = baseY - (i + 1) * p.segmentLength;
                const cpX   = (tipX + nextX) / 2 + sway * 0.5;
                const cpY   = (tipY + nextY) / 2;

                ctx.quadraticCurveTo(cpX, cpY, nextX, nextY);
                tipX = nextX;
                tipY = nextY;
            }

            const gradient = ctx.createLinearGradient(p.x, baseY, tipX, baseY - totalH);
            gradient.addColorStop(0,   p.color + 'dd');
            gradient.addColorStop(0.6, p.color + '99');
            gradient.addColorStop(1,   p.color + '44');

            ctx.strokeStyle = gradient;
            ctx.lineWidth   = p.width;
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';
            ctx.globalAlpha = 0.75;
            ctx.stroke();

            ctx.restore();
        }
    }

    // ── Particles ─────────────────────────────────────────────────────────────

    private _drawParticles(particles: Particle[]): void {
        const ctx = this.ctx;

        for (const p of particles) {
            ctx.save();
            ctx.globalAlpha = p.opacity * 0.85;
            ctx.beginPath();
            ctx.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
        }
    }

    // ── Fish ──────────────────────────────────────────────────────────────────

    private _drawFish(fish: Fish[], sprites: SpriteSheet): void {
        for (const f of fish) {
            const wiggle = Math.sin(f.wigglePhase) * f.wiggleAmp;
            sprites.drawFish(
                this.ctx,
                f.species,
                f.position.x,
                f.position.y,
                f.scale,
                f.flipX,
                f.opacity,
                wiggle,
            );
        }
    }

    dispose(): void {
        this.canvas.remove();
    }
}