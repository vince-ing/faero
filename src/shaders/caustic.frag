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
    
    // 2. The Ray Math
    vec2 lightPos = vec2(0.0, 1.5);
    vec2 dir = uv - lightPos;
    
    float wobble = sin(v_uv.y * 3.0 - u_time * 0.5) * 0.05;
    float angle = atan(dir.x + wobble, -dir.y);
    
    float t = u_time * 0.2;
    float beam1 = clamp(sin(angle * 12.0 + t), 0.0, 1.0);
    float beam2 = clamp(sin(angle * 18.0 - t * 0.8), 0.0, 1.0);
    float beam3 = clamp(sin(angle * 7.0 + t * 1.2), 0.0, 1.0);
    
    float rays = beam1 * beam2 * 0.6 + beam3 * 0.4;
    rays = pow(rays, 1.5);
    
    // 3. The Color Shift
    vec3 rayColor = u_color * 1.5; 
    vec3 finalColor = mix(waterBase, rayColor, rays * 0.5);
    
    // 4. Alpha Setup
    // u_strength is ~0.18, so multiplying by 0.9 gives us a chill ~16% opacity
    float safeAlpha = u_strength * 0.9;
    
    // THE FIX: WebGL requires Premultiplied Alpha!
    // We MUST multiply the RGB by the Alpha before handing it to the browser.
    gl_FragColor = vec4(finalColor * safeAlpha, safeAlpha);
}