import { CausticRenderer }  from './renderer/causticRenderer';
import { BubbleRenderer }   from './renderer/bubbleRenderer';
import { MainRenderer }     from './renderer/mainRenderer';
import { GlowRenderer }     from './renderer/glowRenderer';
import { SpriteSheet }      from './renderer/spriteSheet';
import { FishSystem }       from './simulation/fishSystem';
import { PlantSystem }      from './simulation/plantSystem';
import { ParticleSystem }   from './simulation/particleSystem';
import { InputController }  from './interaction/inputController';
import { startLoop }        from './animation/animationLoop';
import './style.css';

async function bootstrap(): Promise<void> {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Blue tint overlay — shifts the whole screen cooler without changing luminance
    const tint = document.createElement('div');
    tint.id = 'blue-tint';
    document.body.appendChild(tint);

    // ── Renderers ─────────────────────────────────────────────────────────────
    const caustic  = new CausticRenderer(W, H);
    const bubbles  = new BubbleRenderer(W, H);
    const glow     = new GlowRenderer(W, H);
    const main     = new MainRenderer(W, H);

    document.body.appendChild(caustic.canvas);
    document.body.appendChild(bubbles.canvas);
    document.body.appendChild(glow.canvas);
    document.body.appendChild(main.canvas);

    // ── Sprites ───────────────────────────────────────────────────────────────
    const sprites = new SpriteSheet();
    await sprites.load();

    // ── Simulation ────────────────────────────────────────────────────────────
    const fish      = new FishSystem();
    const plants    = new PlantSystem();
    const particles = new ParticleSystem();
    const input     = new InputController();

    // ── Loop ──────────────────────────────────────────────────────────────────
    const { onResize } = startLoop(
        caustic, bubbles, main, glow,
        sprites,
        fish, plants, particles,
        input,
    );

    window.addEventListener('resize', () => {
        onResize(window.innerWidth, window.innerHeight);
    });
}

bootstrap().catch(console.error);