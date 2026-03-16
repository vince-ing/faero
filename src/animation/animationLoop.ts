import { CausticRenderer } from '../renderer/causticRenderer';
import { BubbleRenderer }  from '../renderer/bubbleRenderer';
import { MainRenderer }    from '../renderer/mainRenderer';
import { GlowRenderer }    from '../renderer/glowRenderer';
import { KelpRenderer }    from '../renderer/kelpRenderer';
import { SpriteSheet }     from '../renderer/spriteSheet';
import { FishSystem }      from '../simulation/fishSystem';
import { ParticleSystem }  from '../simulation/particleSystem';
import { InputController } from '../interaction/inputController';

const MOUSE_SCARE_RADIUS = 160;

export function startLoop(
    caustic:   CausticRenderer,
    bubbles:   BubbleRenderer,
    main:      MainRenderer,
    glow:      GlowRenderer,
    kelp:      KelpRenderer,
    sprites:   SpriteSheet,
    fish:      FishSystem,
    particles: ParticleSystem,
    input:     InputController,
): { onResize: (w: number, h: number) => void } {

    let lastTime = performance.now();

    function tick(now: number): void {
        requestAnimationFrame(tick);

        const dt    = Math.min((now - lastTime) / 1000, 0.05);
        lastTime    = now;
        const t     = now / 1000;
        const mouse = input.getMousePos();
        const h     = window.innerHeight;

        // ── Simulate ──────────────────────────────────────────────────────────
        fish.update(dt, mouse, MOUSE_SCARE_RADIUS);
        particles.update(dt);

        // ── Render ────────────────────────────────────────────────────────────
        caustic.render(t);
        bubbles.render(t);
        kelp.render(t);
        glow.render(fish.getSorted());
        main.render(
            fish.getSorted(),
            particles.getAll(),
            sprites,
            h,
        );
    }

    requestAnimationFrame(tick);

    return {
        onResize(w: number, h: number): void {
            caustic.resize(w, h);
            bubbles.resize(w, h);
            kelp.resize(w, h);
            main.resize(w, h);
            glow.resize(w, h);
            fish.resize(w, h);
            particles.resize(w, h);
        },
    };
}