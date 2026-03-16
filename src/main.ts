import { CausticRenderer } from './renderer/causticRenderer';
import { BubbleRenderer }  from './renderer/bubbleRenderer';
import { MainRenderer }    from './renderer/mainRenderer';
import { GlowRenderer }    from './renderer/glowRenderer';
import { KelpRenderer }    from './renderer/kelpRenderer';
import { SpriteSheet }     from './renderer/spriteSheet';
import { FishSystem }      from './simulation/fishSystem';
import { ParticleSystem }  from './simulation/particleSystem';
import { InputController } from './interaction/inputController';
import { startLoop }       from './animation/animationLoop';
import './style.css';

async function bootstrap(): Promise<void> {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // ── Renderers ─────────────────────────────────────────────────────────────
    const caustic  = new CausticRenderer(W, H);
    const bubbles  = new BubbleRenderer(W, H);
    const glow     = new GlowRenderer(W, H);
    const kelp     = new KelpRenderer(W, H);
    const main     = new MainRenderer(W, H);

    // z-index order: caustic(1) → bubbles(2) → kelp(3) → glow(3) → main(4)
    document.body.appendChild(caustic.canvas);
    document.body.appendChild(bubbles.canvas);
    document.body.appendChild(kelp.canvas);
    document.body.appendChild(glow.canvas);
    document.body.appendChild(main.canvas);

    // Blue tint on top of everything
    const tint = document.createElement('div');
    tint.id = 'blue-tint';
    document.body.appendChild(tint);

    // ── Sprites ───────────────────────────────────────────────────────────────
    const sprites = new SpriteSheet();
    await sprites.load();

    // ── Simulation ────────────────────────────────────────────────────────────
    const fish      = new FishSystem();
    const particles = new ParticleSystem();
    const input     = new InputController();

    // ── Loop ──────────────────────────────────────────────────────────────────
    const { onResize } = startLoop(
        caustic, bubbles, main, glow, kelp,
        sprites,
        fish, particles,
        input,
    );

    window.addEventListener('resize', () => {
        onResize(window.innerWidth, window.innerHeight);
    });
}

bootstrap().catch(console.error);