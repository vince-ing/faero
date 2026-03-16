precision mediump float;

varying vec2 v_uv;

uniform float u_time;
uniform float u_aspect;
uniform float u_strength;
uniform vec3  u_color; 

void main() {
    vec2 uv = v_uv * 2.0 - 1.0;
    uv.x *= u_aspect;
    
    vec2 lightPos = vec2(0.0, 12.0); 
    vec2 dir = uv - lightPos;
    
    float wobble = sin(v_uv.y * 3.0 - u_time * 0.5) * 0.1;
    float angle = atan(dir.x + wobble, -dir.y);
    
    float t = u_time * 0.2;
    float beam1 = clamp(sin(angle * 80.0 + t), 0.0, 1.0);
    float beam2 = clamp(sin(angle * 120.0 - t * 0.8), 0.0, 1.0);
    float beam3 = clamp(sin(angle * 50.0 + t * 1.2), 0.0, 1.0);
    
    float rays = beam1 * beam2 * 0.6 + beam3 * 0.4;
    rays = pow(rays, 1.5);

    vec3 rayColor  = vec3(1.5);
    vec3 waterBase = vec3(0.4);
    float grey = dot(mix(waterBase, rayColor, rays * 0.5), vec3(0.299, 0.587, 0.114));

    // Blue tint: keep R and G lower than B so it reads as cool/blue
    vec3 finalColor = vec3(grey * 0.6, grey * 0.75, grey * 1.0);

    float safeAlpha = u_strength * 0.9;
    gl_FragColor = vec4(finalColor * safeAlpha, safeAlpha);
}
