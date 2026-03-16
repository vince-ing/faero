import { FishSpecies } from '../core/types';
import { FISH_SPRITES, BUBBLE_SPRITE, SPARKLE_SPRITE, FISH_BASE_HEIGHT } from '../core/config';

interface SpriteEntry {
    image:       HTMLImageElement;
    naturalW:    number;
    naturalH:    number;
    aspectRatio: number;   // width / height
}

export class SpriteSheet {
    private sprites: Map<string, SpriteEntry> = new Map();
    private loaded  = false;

    // ── Loading ───────────────────────────────────────────────────────────────

    async load(): Promise<void> {
        const paths: string[] = [
            ...Object.values(FISH_SPRITES),
            BUBBLE_SPRITE,
            SPARKLE_SPRITE,
        ];

        await Promise.all(paths.map(path => this._loadOne(path)));
        this.loaded = true;
    }

    private _loadOne(path: string): Promise<void> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(path, {
                    image:       img,
                    naturalW:    img.naturalWidth,
                    naturalH:    img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight,
                });
                resolve();
            };
            img.onerror = () => {
                // Missing sprite — create a coloured placeholder so the rest
                // of the app still runs while assets are being added
                console.warn(`SpriteSheet: could not load ${path}, using placeholder`);
                const canvas  = document.createElement('canvas');
                canvas.width  = 64;
                canvas.height = 40;
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
                ctx.beginPath();
                // Simple fish-shaped ellipse as placeholder
                ctx.ellipse(32, 20, 28, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.beginPath();
                ctx.ellipse(42, 16, 5, 4, 0, 0, Math.PI * 2);
                ctx.fill();

                const placeholder = new Image();
                placeholder.src = canvas.toDataURL();
                placeholder.onload = () => {
                    this.sprites.set(path, {
                        image:       placeholder,
                        naturalW:    64,
                        naturalH:    40,
                        aspectRatio: 64 / 40,
                    });
                    resolve();
                };
            };
            img.src = path;
        });
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    // ── Drawing ───────────────────────────────────────────────────────────────

    drawFish(
        ctx:     CanvasRenderingContext2D,
        species: FishSpecies,
        x:       number,
        y:       number,
        scale:   number,
        flipX:   boolean,
        opacity: number,
        wiggle:  number,   // radians — applied as a slight rotation
    ): void {
        const path  = FISH_SPRITES[species];
        const entry = this.sprites.get(path);
        if (!entry) return;

        const baseH = FISH_BASE_HEIGHT[species];
        const h     = baseH * scale;
        const w     = h * entry.aspectRatio;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.rotate(wiggle * 0.12);   // subtle body tilt from wiggle

        if (flipX) {
            ctx.scale(-1, 1);
        }

        ctx.drawImage(entry.image, -w / 2, -h / 2, w, h);
        ctx.restore();
    }

    drawBubble(
        ctx:     CanvasRenderingContext2D,
        x:       number,
        y:       number,
        radius:  number,
        opacity: number,
    ): void {
        const entry = this.sprites.get(BUBBLE_SPRITE);

        if (entry) {
            // Use sprite if available
            const size = radius * 2;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.drawImage(entry.image, x - radius, y - radius, size, size);
            ctx.restore();
        } else {
            // Fallback: draw a simple circle
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(180, 230, 255, 0.18)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(200, 240, 255, 0.7)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
        }
    }

    drawSparkle(
        ctx:     CanvasRenderingContext2D,
        x:       number,
        y:       number,
        radius:  number,
        opacity: number,
        color:   string,
    ): void {
        const entry = this.sprites.get(SPARKLE_SPRITE);

        if (entry) {
            const size = radius * 2;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.drawImage(entry.image, x - radius, y - radius, size, size);
            ctx.restore();
        } else {
            // Fallback: small glowing dot
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    getFishDimensions(species: FishSpecies, scale: number): { w: number; h: number } {
        const path  = FISH_SPRITES[species];
        const entry = this.sprites.get(path);
        const baseH = FISH_BASE_HEIGHT[species];
        const h     = baseH * scale;
        const w     = entry ? h * entry.aspectRatio : h * 1.6;
        return { w, h };
    }
}