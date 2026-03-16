import vertSrc from '../shaders/caustic.vert?raw';
import fragSrc from '../shaders/caustic.frag?raw';
import { CAUSTIC_STRENGTH, CAUSTIC_SPEED } from '../core/constants';
import { PALETTE } from '../core/config';

function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vert));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
    }
    return program;
}

export class CausticRenderer {
    readonly canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;

    private u_time:     WebGLUniformLocation;
    private u_strength: WebGLUniformLocation;
    private u_aspect:   WebGLUniformLocation;
    private u_color:    WebGLUniformLocation;

    private color: [number, number, number];

    constructor(width: number, height: number) {
        this.canvas = document.createElement('canvas');
        this.canvas.width  = width;
        this.canvas.height = height;
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        const gl = this.canvas.getContext('webgl');
        if (!gl) throw new Error('WebGL not supported');
        this.gl = gl;

        // Additive blending — rays only add light, never darken
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);

        this.program = createProgram(gl, vertSrc, fragSrc);
        gl.useProgram(this.program);

        const verts = new Float32Array([
            -1, -1,   1, -1,   -1,  1,
            -1,  1,   1, -1,    1,  1,
        ]);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        const a_pos = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(a_pos);
        gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

        this.u_time     = gl.getUniformLocation(this.program, 'u_time')!;
        this.u_strength = gl.getUniformLocation(this.program, 'u_strength')!;
        this.u_aspect   = gl.getUniformLocation(this.program, 'u_aspect')!;
        this.u_color    = gl.getUniformLocation(this.program, 'u_color')!;

        this.color = hexToRgb(PALETTE.causticColor);

        gl.uniform1f(this.u_strength, CAUSTIC_STRENGTH);
        gl.uniform3fv(this.u_color, this.color);
    }

    resize(width: number, height: number): void {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width  = width * dpr;
        this.canvas.height = height * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    render(time: number): void {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(this.u_time,   time * CAUSTIC_SPEED);
        gl.uniform1f(this.u_aspect, this.canvas.width / this.canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    setStrength(v: number): void {
        this.gl.uniform1f(this.u_strength, v);
    }

    setColor(hex: string): void {
        this.color = hexToRgb(hex);
        this.gl.uniform3fv(this.u_color, this.color);
    }

    dispose(): void {
        this.gl.deleteProgram(this.program);
        this.canvas.remove();
    }
}