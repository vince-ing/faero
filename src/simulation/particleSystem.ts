import { Particle, Vec2 } from '../core/types';
import { PARTICLE_MAX } from '../core/constants';
import { PALETTE } from '../core/config';

let _id = 0;

const MOTE_COLORS = [
    PALETTE.glowCyan,
    PALETTE.glowAqua,
    PALETTE.glowLime,
    'rgba(200, 240, 255, 0.9)',
];

function spawnMote(screenW: number, screenH: number): Particle {
    return {
        id:       _id++,
        position: {
            x: Math.random() * screenW,
            y: Math.random() * screenH,
        },
        velocity: {
            x: (Math.random() - 0.5) * 12,
            y: -4 - Math.random() * 10,   // drift upward slowly
        },
        radius:    1 + Math.random() * 2.5,
        opacity:   0,
        life:      4 + Math.random() * 6,
        lifeTotal: 4 + Math.random() * 6,
        color:     MOTE_COLORS[Math.floor(Math.random() * MOTE_COLORS.length)],
    };
}

export class ParticleSystem {
    private particles: Particle[] = [];
    private screenW = window.innerWidth;
    private screenH = window.innerHeight;

    // Spawn initial ambient motes staggered across the screen
    constructor() {
        for (let i = 0; i < 40; i++) {
            const p = spawnMote(this.screenW, this.screenH);
            p.life = Math.random() * p.lifeTotal;   // stagger lifetimes
            this.particles.push(p);
        }
    }

    resize(w: number, h: number): void {
        this.screenW = w;
        this.screenH = h;
    }

    // Burst of particles at a position — used for bubble pops, etc.
    burst(pos: Vec2, count: number, color?: string): void {
        if (this.particles.length >= PARTICLE_MAX) return;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 30 + Math.random() * 80;
            this.particles.push({
                id:       _id++,
                position: { x: pos.x, y: pos.y },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed,
                },
                radius:    2 + Math.random() * 3,
                opacity:   0.8 + Math.random() * 0.2,
                life:      0.4 + Math.random() * 0.5,
                lifeTotal: 0.4 + Math.random() * 0.5,
                color:     color ?? MOTE_COLORS[Math.floor(Math.random() * MOTE_COLORS.length)],
            });
        }
    }

    update(dt: number): void {
        for (const p of this.particles) {
            p.position.x += p.velocity.x * dt;
            p.position.y += p.velocity.y * dt;

            // Slow down
            p.velocity.x *= 0.97;
            p.velocity.y *= 0.97;

            p.life -= dt;

            const t = p.life / p.lifeTotal;
            // Fade in for first 20% of life, fade out for last 40%
            if (t > 0.8) {
                p.opacity = (1 - t) / 0.2;
            } else if (t < 0.4) {
                p.opacity = t / 0.4;
            } else {
                p.opacity = 1;
            }
        }

        // Remove dead particles and top up ambient motes
        this.particles = this.particles.filter(p => p.life > 0);

        while (this.particles.length < 40) {
            const p = spawnMote(this.screenW, this.screenH);
            this.particles.push(p);
        }
    }

    getAll(): Particle[] {
        return this.particles;
    }
}