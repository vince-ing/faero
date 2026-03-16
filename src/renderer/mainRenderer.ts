import { Fish, Particle } from '../core/types';
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
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width  = width * dpr;
        this.canvas.height = height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    render(
        fish:      Fish[],
        particles: Particle[],
        sprites:   SpriteSheet,
        screenH:   number,
    ): void {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this._drawParticles(particles);
        this._drawFish(fish, sprites);
    }

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

    private _drawFish(fish: Fish[], sprites: SpriteSheet): void {
        for (const f of fish) {
            const wiggle = Math.sin(f.wigglePhase) * f.wiggleAmp;
            sprites.drawFish(
                this.ctx,
                f.species,
                Math.round(f.position.x), // Rounding stops the shimmer
                Math.round(f.position.y),
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