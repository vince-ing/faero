precision mediump float;

varying vec2 v_uv;

uniform float u_time;
uniform float u_aspect;
uniform float u_strength;
uniform vec3  u_color; 

void main() {
    vec2 uv = v_uv * 2.0 - 1.0;
    uv.x *= u_aspect;
    
    // 1. Base Water Color
    vec3 waterBase = u_color * 0.4; 
    
    // 2. The Ray Math (FIXED: Pushed way up!)
    // Pushing the origin high up forces the rays to fall almost vertically, 
    // blanketing the entire top edge of the screen without leaving empty corners.
    vec2 lightPos = vec2(0.0, 12.0); 
    vec2 dir = uv - lightPos;
    
    // Slightly increased wobble since the rays are longer now
    float wobble = sin(v_uv.y * 3.0 - u_time * 0.5) * 0.1;
    float angle = atan(dir.x + wobble, -dir.y);
    
    float t = u_time * 0.2;
    // Increased the angle multipliers dramatically to compensate for the higher origin
    float beam1 = clamp(sin(angle * 80.0 + t), 0.0, 1.0);
    float beam2 = clamp(sin(angle * 120.0 - t * 0.8), 0.0, 1.0);
    float beam3 = clamp(sin(angle * 50.0 + t * 1.2), 0.0, 1.0);
    
    float rays = beam1 * beam2 * 0.6 + beam3 * 0.4;
    rays = pow(rays, 1.5);
    
    // 3. The Color Shift
    vec3 rayColor = u_color * 1.5; 
    vec3 finalColor = mix(waterBase, rayColor, rays * 0.5);
    
    // 4. Alpha Setup
    float safeAlpha = u_strength * 0.9;
    
    // Premultiplied alpha output
    gl_FragColor = vec4(finalColor * safeAlpha, safeAlpha);
}