precision mediump float;

varying vec2 v_uv;

uniform float u_time;
uniform vec2  u_resolution;

uniform float u_noiseScale;
uniform vec3  u_colorBase;
uniform vec3  u_colorIridescence;

// Master bubble amount 0.0–1.0, controlled via BUBBLE_AMOUNT in constants.ts
uniform float u_amount;
// Per-size-tier toggles 0.0–1.0, controlled via BUBBLE_SIZE_* in constants.ts
uniform float u_sizeLarge;
uniform float u_sizeMedium;
uniform float u_sizeSmall;
uniform float u_sizeTiny;
uniform float u_sizeMicro;
uniform float u_sizeNano;

// ── Helpers ───────────────────────────────────────────────────────────────────

vec4 NC0 = vec4(0.0, 157.0, 113.0, 270.0);
vec4 NC1 = vec4(1.0, 158.0, 114.0, 271.0);

vec4 hash4(vec4 n) { return fract(sin(n) * 753.5453123); }
vec2 hash2(vec2 n) { return fract(sin(n) * 753.5453123); }

float noise2(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 157.0;
    vec2 s1 = mix(hash2(vec2(n) + NC0.xy), hash2(vec2(n) + NC1.xy), vec2(f.x));
    return mix(s1.x, s1.y, f.y);
}

vec2 hash2a(vec2 x, float anim) {
    float r = 523.0 * sin(dot(x, vec2(53.3158, 43.6143)));
    float xa1 = fract(anim);        float xb1 = anim - xa1;
    anim += 0.5;
    float xa2 = fract(anim);        float xb2 = anim - xa2;
    vec2 z1 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1))); r += 1.0;
    vec2 z2 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1))); r += 1.0;
    vec2 z3 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2))); r += 1.0;
    vec2 z4 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2)));
    return (mix(z1, z2, xa1) + mix(z3, z4, xa2)) * 0.5;
}

float hashNull(vec2 x) {
    return fract(523.0 * sin(dot(x, vec2(53.3158, 43.6143))));
}

vec4 booble(vec2 te, vec2 id, float numCells) {
    float d = dot(te, te);
    vec2 te1 = te + (id - vec2(0.5, 0.5)) * 0.4 / numCells;
    vec2 te2 = -te1;

    float zb1 = max(pow(noise2(te2 * 1000.11 * d * u_noiseScale), 10.0), 0.01);
    float zb2 = noise2(te1 * 1000.11 * d * u_noiseScale);
    float zb3 = noise2(te1 * 200.11 * d);
    float zb4 = noise2(te1 * 200.11 * d + vec2(20.0));

    vec4 colorb = vec4(1.0);
    colorb.xyz = colorb.xyz * (0.7 + noise2(te1 * 1000.11 * d) * 0.3);
    zb2 = max(pow(zb2, 20.1), 0.01);
    colorb.xyz = colorb.xyz * (zb2 * 1.9);

    vec4 color = vec4(
        noise2(te2 * 10.8 * u_noiseScale),
        noise2(te2 * 9.5  * u_noiseScale + vec2(15.0, 15.0)),
        noise2(te2 * 11.2 * u_noiseScale + vec2(12.0, 12.0)),
        1.0
    );
    color = mix(color, vec4(1.0), noise2(te2 * 20.5 + vec2(200.0, 200.0)));
    color.xyz = color.xyz * (0.7 + noise2(te2 * 1000.11 * d) * 0.3);
    color.xyz = color.xyz * (0.2 + zb1 * 1.9);

    float r1 = max(min((0.033 - min(0.04, d)) * 100.0 / sqrt(numCells), 1.0), -1.6);
    float d2  = (0.06 - min(0.06, d)) * 10.0;
    d         = (0.04 - min(0.04, d)) * 10.0;
    color.xyz = color.xyz + colorb.xyz * d * 1.5;

    float f1 = min(d * 10.0, 0.5 - d) * 2.2;
    f1 = pow(f1, 4.0);
    float f2 = min(min(d * 4.1, 0.9 - d) * 2.0 * r1, 1.0);
    float f3 = min(d2 * 2.0, 0.7 - d2) * 2.2;
    f3 = pow(f3, 4.0);

    return vec4(color * max(min(f1 + f2, 1.0), -0.5)
              + vec4(zb3) * f3
              - vec4(zb4) * (f2 * 0.5 + f1) * 0.5);
}

vec4 Cells(vec2 p, vec2 move, float numCells, float count, float rise) {
    vec2 inp  = p + move;
    inp.y    -= rise;
    inp      *= numCells;

    float d   = 1.0;
    vec2  pos = vec2(0.0);
    vec2  cellId = vec2(0.0);

    for (int xo = -1; xo <= 1; xo++) {
        for (int yo = -1; yo <= 1; yo++) {
            vec2 tp  = floor(inp) + vec2(xo, yo);
            vec2 rr  = mod(tp, numCells);
            vec2 tpA = tp + (hash2a(rr, u_time * 0.1) + hash2a(rr, u_time * 0.1 + 0.25)) * 0.5;
            vec2 l   = inp - tpA;
            float dr = dot(l, l);
            if (hashNull(rr) > count) {
                if (d > dr) {
                    d      = dr;
                    pos    = tpA;
                    cellId = tp;
                }
            }
        }
    }

    if (d >= 0.06) return vec4(0.0);
    vec2 te = inp - pos;
    return booble(te, hash2(cellId), numCells);
}

void main() {
    vec2  uv   = v_uv * vec2(u_resolution.x / u_resolution.y, 1.0) * 0.5;
    float rise = fract(u_time * 0.018);

    vec2 l1 = vec2( u_time * 0.020,  u_time * 0.020);
    vec2 l2 = vec2(-u_time * 0.010,  u_time * 0.007);
    vec2 l3 = vec2(0.0,              u_time * 0.010);

    vec4 e = vec4(0.0);

    float a = u_amount;
    vec4 cr1 = Cells(uv, vec2(20.2449,  93.78)  + l1, 2.0,  1.0 - a * 0.50 * u_sizeLarge,  rise * 0.30);
    vec4 cr2 = Cells(uv, vec2(0.0,       0.0),         3.0,  1.0 - a * 0.50 * u_sizeMedium, rise * 0.50);
    vec4 cr3 = Cells(uv, vec2(230.79,  193.2)   + l2, 4.0,  1.0 - a * 0.50 * u_sizeSmall,  rise * 0.70);
    vec4 cr4 = Cells(uv, vec2(200.19,  393.2)   + l3, 7.0,  1.0 - a * 0.80 * u_sizeTiny,   rise * 1.00);
    vec4 cr5 = Cells(uv, vec2(10.3245, 233.645) + l3, 9.2,  1.0 - a * 0.90 * u_sizeMicro,  rise * 1.20);
    vec4 cr6 = Cells(uv, vec2(10.3245, 233.645) + l3, 14.2, 1.0 - a * 0.95 * u_sizeNano,   rise * 1.50);

    e = max(e - vec4(dot(cr6, cr6)) * 0.1, 0.0) + cr6 * 1.6;
    e = max(e - vec4(dot(cr5, cr5)) * 0.1, 0.0) + cr5 * 1.6;
    e = max(e - vec4(dot(cr4, cr4)) * 0.1, 0.0) + cr4 * 1.3;
    e = max(e - vec4(dot(cr3, cr3)) * 0.1, 0.0) + cr3 * 1.1;
    e = max(e - vec4(dot(cr2, cr2)) * 0.1, 0.0) + cr2 * 1.4;
    e = max(e - vec4(dot(cr1, cr1)) * 0.1, 0.0) + cr1 * 1.8;

    vec3 rawColor = max(e.rgb, 0.0);
    float intensity = dot(rawColor, vec3(0.299, 0.587, 0.114));

    vec3 bright   = min(rawColor * 1.2, 1.0);
    vec3 darkEdge = vec3(0.0, 0.03, 0.08);
    vec3 finalColor = mix(darkEdge, bright, smoothstep(0.05, 0.4, intensity));

    float alpha = clamp(intensity * 1.5, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, alpha);
}
