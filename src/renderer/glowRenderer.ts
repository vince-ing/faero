import { Fish } from '../core/types';
import { GLOW_RADIUS_MULT, GLOW_ALPHA } from '../core/constants';
import { FISH_BASE_HEIGHT, PALETTE } from '../core/config';

const GLOW_COLORS = [
    PALETTE.glowCyan,
    PALETTE.glowAqua,
    PALETTE.glowLime,
];

export class GlowRenderer {
    readonly canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        this.canvas = document.createElement('canvas');
        // Quarter resolution — glow is blurry by nature so we save GPU this way
        this.canvas.width  = Math.max(1, width  >> 2);
        this.canvas.height = Math.max(1, height >> 2);
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            mix-blend-mode: screen;
            z-index: 2;
        `;
        this.ctx = this.canvas.getContext('2d')!;
    }

    resize(width: number, height: number): void {
        this.canvas.width  = Math.max(1, width  >> 2);
        this.canvas.height = Math.max(1, height >> 2);
    }

    render(fish: Fish[]): void {
        const { canvas, ctx } = this;
        const W = canvas.width;
        const H = canvas.height;
        const scaleX = W / window.innerWidth;
        const scaleY = H / window.innerHeight;

        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (const f of fish) {
            const baseH    = FISH_BASE_HEIGHT[f.species];
            const fishH    = baseH * f.scale;
            const glowR    = fishH * GLOW_RADIUS_MULT;
            const sx       = f.position.x * scaleX;
            const sy       = f.position.y * scaleY;
            const glowRScaled = glowR * scaleX;

            // Pick a glow color cycling by fish id so different fish glow
            // in slightly different hues — the FA iridescent look
            const colorHex = GLOW_COLORS[f.id % GLOW_COLORS.length];
            const rgb      = hexToRgbStr(colorHex);

            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRScaled);
            grad.addColorStop(0,   `rgba(${rgb}, ${(GLOW_ALPHA * f.opacity * 0.6).toFixed(3)})`);
            grad.addColorStop(0.4, `rgba(${rgb}, ${(GLOW_ALPHA * f.opacity * 0.3).toFixed(3)})`);
            grad.addColorStop(1,   `rgba(${rgb}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(sx, sy, glowRScaled, glowRScaled * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    dispose(): void {
        this.canvas.remove();
    }
}

function hexToRgbStr(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}