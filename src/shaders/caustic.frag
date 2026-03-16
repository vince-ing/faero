precision mediump float;

varying vec2 v_uv;

uniform float u_time;
uniform float u_aspect;
uniform float u_strength;
uniform vec3  u_color; 

void main() {
    vec2 uv = v_uv * 2.0 - 1.0;
    uv.x *= u_aspect;
    
    vec3 waterBase = u_color * 0.4; 
    
    vec2 lightPos = vec2(0.0, 12.0); 
    vec2 dir = uv - lightPos;
    
    float wobble = sin(v_uv.y * 3.0 - u_time * 0.5) * 0.1;
    float angle = atan(dir.x + wobble, -dir.y);
    
    float t = u_time * 0.2;
    float beam1 = clamp(sin(angle * 120.0 + t), 0.0, 1.0);
    float beam2 = clamp(sin(angle * 180.0 - t * 0.8), 0.0, 1.0);
    float beam3 = clamp(sin(angle * 75.0  + t * 1.2), 0.0, 1.0);
    float beam4 = clamp(sin(angle * 210.0 - t * 0.6), 0.0, 1.0);
    
    float rays = beam1 * beam2 * 0.5 + beam3 * beam4 * 0.3 + beam3 * 0.2;
    rays = pow(rays, 1.5);
    
    vec3 rayColor = u_color * 1.5;
    vec3 finalColor = mix(waterBase, rayColor, rays * 0.5);

    float luma = dot(finalColor, vec3(0.299, 0.587, 0.114));
    float safeAlpha = u_strength * 0.9;
    gl_FragColor = vec4(finalColor * safeAlpha, safeAlpha);
}
