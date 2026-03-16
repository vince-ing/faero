precision mediump float;

varying vec2 v_uv;

uniform float u_time;
uniform float u_strength;
uniform float u_aspect;
uniform vec3  u_color;

// ── Noise helpers ─────────────────────────────────────────────────────────────
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// Two octaves of noise for organic look
float fbm(vec2 p) {
    float v = 0.0;
    v += vnoise(p)           * 0.55;
    v += vnoise(p * 2.1 + vec2(3.7, 8.1)) * 0.30;
    v += vnoise(p * 4.3 + vec2(1.2, 5.6)) * 0.15;
    return v;
}

// ── Caustic pattern ───────────────────────────────────────────────────────────
// Interfering sine waves — classic aquarium caustics look.
// We use three overlapping wave sets at slightly different angles and speeds.
float causticPattern(vec2 p, float t) {
    // Scale up so the pattern is visible at screen size
    p *= 3.5;

    float wave1 = sin(p.x * 1.3 + sin(p.y * 0.9 + t * 0.7) * 1.8 + t * 0.5);
    float wave2 = sin(p.y * 1.1 + sin(p.x * 1.2 + t * 0.6) * 1.6 + t * 0.4);
    float wave3 = sin((p.x + p.y) * 0.9 + sin((p.x - p.y) * 0.8 + t * 0.5) * 1.4 + t * 0.3);

    // Warp the sample point slightly with noise for organic edges
    vec2 warp = vec2(
        fbm(p * 0.4 + vec2(t * 0.08, 0.0)),
        fbm(p * 0.4 + vec2(0.0, t * 0.07))
    ) * 2.0 - 1.0;
    float wave4 = sin((p.x + warp.x) * 1.4 + (p.y + warp.y) * 1.1 + t * 0.45);

    // Combine and remap to 0..1
    float combined = (wave1 + wave2 + wave3 + wave4) * 0.25 + 0.5;

    // Sharpen: raise to a power to create bright focal lines on dark bg
    return pow(clamp(combined, 0.0, 1.0), 3.5);
}

// ── Light shafts ──────────────────────────────────────────────────────────────
// Soft vertical columns of light drifting slowly — classic underwater look.
float lightShafts(vec2 uv, float t) {
    float shafts = 0.0;
    // Three shafts at different x positions, widths, and drift speeds
    shafts += exp(-pow((uv.x - 0.22 - sin(t * 0.08) * 0.06) * 12.0, 2.0)) * 0.5;
    shafts += exp(-pow((uv.x - 0.55 - sin(t * 0.06 + 1.2) * 0.08) * 9.0,  2.0)) * 0.4;
    shafts += exp(-pow((uv.x - 0.78 - sin(t * 0.07 + 2.4) * 0.05) * 14.0, 2.0)) * 0.35;
    // Fade shafts near the bottom (they come from above)
    float vertFade = smoothstep(1.0, 0.3, uv.y);
    return shafts * vertFade;
}

void main() {
    vec2 uv = v_uv;
    // Correct for aspect ratio so pattern isn't stretched
    vec2 p = vec2(uv.x * u_aspect, uv.y);

    float t = u_time;

    float caustic = causticPattern(p, t);
    float shafts  = lightShafts(uv, t);

    // Caustics are brightest near the top (light source above water surface)
    float topBias = mix(0.5, 1.0, 1.0 - uv.y * uv.y);

    float brightness = (caustic * 0.75 + shafts * 0.35) * topBias * u_strength;

    // Output: colored light on black — composited as 'screen' or 'lighter'
    // in the renderer so it only ever brightens what's underneath
    gl_FragColor = vec4(u_color * brightness, brightness);
}
