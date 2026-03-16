// KelpRenderer — 2D canvas kelp drawn as layered tapered bezier blades
// Looks far more organic than SDF and is guaranteed to render correctly.

interface Blade {
    x: number;          // base x position
    height: number;     // max height in px
    width: number;      // base width in px
    swayPhase: number;  // individual sway offset
    swaySpeed: number;
    swayAmp: number;    // max tip deflection in px
    colorA: string;     // base color
    colorB: string;     // tip color
    segments: number;   // how many bezier segments to stack
    layer: number;      // 0=back 1=front, affects opacity/size
    lean: number;       // permanent lean angle (-1 to 1)
}

export class KelpRenderer {
    readonly canvas: HTMLCanvasElement;
    private ctx:     CanvasRenderingContext2D;
    private blades:  Blade[] = [];
    private W = 0;
    private H = 0;

    // Fraction of screen height the kelp occupies — tweak to taste
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
        this.W = width;
        this.H = height;
        this.canvas.width  = width;
        this.canvas.height = height;
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

        // Generate sparse clusters across the screen width
        const numClusters = 2 + Math.floor(Math.random() * 3);
        const clusterCenters: number[] = [];
        for (let c = 0; c < numClusters; c++) {
            // Space clusters with some randomness but spread across width
            clusterCenters.push((c / numClusters + Math.random() * 0.15) * this.W);
        }

        for (let layer = 0; layer <= 1; layer++) {
            for (const cx of clusterCenters) {
                // Each cluster has 2-5 blades
                const bladesInCluster = 2 + Math.floor(Math.random() * 3);
                const clusterSpread = 60 + Math.random() * 1000;

                for (let j = 0; j < bladesInCluster; j++) {
                    const [ca, cb] = colorPairs[Math.floor(Math.random() * colorPairs.length)];
                    // Blades within a cluster share similar x, spread by gaussian-ish offset
                    const offsetX = (Math.random() + Math.random() - 1) * clusterSpread;
                    this.blades.push({
                        x:         cx + offsetX,
                        height:    zoneH * (0.35 + Math.random() * 0.7),
                        width:     layer === 0
                                       ? 10 + Math.random() * 10
                                       : 16 + Math.random() * 16,
                        swayPhase:  Math.random() * Math.PI * 2,
                        swaySpeed:  0.18 + Math.random() * 0.22,
                        swayAmp:    12 + Math.random() * 20,
                        colorA:     ca,
                        colorB:     cb,
                        segments:   4 + Math.floor(Math.random() * 3),
                        layer,
                        lean:       (Math.random() - 0.5) * 0.6,
                    });
                }
            }
        }

        // Sort back to front
        this.blades.sort((a, b) => a.layer - b.layer);
    }

    render(time: number): void {
        const { ctx, W, H } = this;
        const zoneH = H * this.KELP_ZONE;
        const baseY = H + 60;   // blades root below the screen so bases are never visible

        ctx.clearRect(0, 0, W, H);

        for (const b of this.blades) {
            const SEG = 6; // spine points: base + 4 inner + tip

            // Build spine points bottom to top
            // Each point has its own wave combo so the blade snakes freely
            const spineX: number[] = [];
            const spineY: number[] = [];

            for (let i = 0; i <= SEG; i++) {
                const frac = i / SEG;
                // Influence grows non-linearly toward tip
                const influence = frac * frac;

                // Each segment driven by overlapping waves at coprime frequencies
                const wx = Math.sin(time * b.swaySpeed * 1.00 + b.swayPhase + frac * 2.1) * b.swayAmp * influence
                         + Math.sin(time * b.swaySpeed * 0.53 + b.swayPhase + frac * 3.7 + 1.2) * b.swayAmp * 0.55 * influence
                         + Math.sin(time * b.swaySpeed * 1.41 + b.swayPhase + frac * 1.3 + 2.4) * b.swayAmp * 0.28 * influence;
                const wy = Math.sin(time * b.swaySpeed * 0.77 + b.swayPhase + frac * 4.2 + 0.8) * b.swayAmp * 0.12 * influence;

                spineX.push(b.x + wx + b.lean * b.height * frac * 0.5);
                spineY.push(baseY - b.height * frac + wy);
            }

            const hw = (frac: number) => {
                // Narrow base, peaks around 25% up, tapers to point at tip
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

            // Build left and right edge point arrays from spine + perpendicular offset
            const leftX: number[] = [];
            const leftY: number[] = [];
            const rightX: number[] = [];
            const rightY: number[] = [];

            for (let i = 0; i <= SEG; i++) {
                const frac = i / SEG;
                // Perpendicular to spine at this point
                const prevI = Math.max(i - 1, 0);
                const nextI = Math.min(i + 1, SEG);
                const dx = spineX[nextI] - spineX[prevI];
                const dy = spineY[nextI] - spineY[prevI];
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const px = -dy / len;  // perpendicular x
                const py =  dx / len;  // perpendicular y
                const w = hw(frac);
                leftX.push(spineX[i] + px * w);
                leftY.push(spineY[i] + py * w);
                rightX.push(spineX[i] - px * w);
                rightY.push(spineY[i] - py * w);
            }

            // Draw filled blade using smooth catmull-rom style through edge points
            ctx.beginPath();
            ctx.moveTo(leftX[0], leftY[0]);
            for (let i = 0; i < SEG; i++) {
                const mx = (leftX[i] + leftX[i+1]) / 2;
                const my = (leftY[i] + leftY[i+1]) / 2;
                ctx.quadraticCurveTo(leftX[i], leftY[i], mx, my);
            }
            ctx.lineTo(leftX[SEG], leftY[SEG]);
            // Right edge in reverse
            for (let i = SEG; i > 0; i--) {
                const mx = (rightX[i] + rightX[i-1]) / 2;
                const my = (rightY[i] + rightY[i-1]) / 2;
                ctx.quadraticCurveTo(rightX[i], rightY[i], mx, my);
            }
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // Soft midrib highlight down the spine
            const hlGrad = ctx.createLinearGradient(b.x, baseY, tipX, tipY);
            hlGrad.addColorStop(0,    'rgba(160,255,190,0.00)');
            hlGrad.addColorStop(0.2,  'rgba(160,255,190,0.18)');
            hlGrad.addColorStop(0.65, 'rgba(210,255,225,0.28)');
            hlGrad.addColorStop(1,    'rgba(210,255,225,0.00)');

            ctx.beginPath();
            ctx.moveTo(spineX[0], spineY[0]);
            for (let i = 0; i < SEG - 1; i++) {
                const mx = (spineX[i] + spineX[i+1]) / 2;
                const my = (spineY[i] + spineY[i+1]) / 2;
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