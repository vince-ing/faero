import { Vec2 } from '../core/types';

export class InputController {
    private mouse: Vec2 | null = null;

    constructor() {
        window.addEventListener('mousemove', (e) => {
            this.mouse = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseleave', () => {
            this.mouse = null;
        });

        // Touch support
        window.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            if (t) this.mouse = { x: t.clientX, y: t.clientY };
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse = null;
        });
    }

    getMousePos(): Vec2 | null {
        return this.mouse;
    }
}