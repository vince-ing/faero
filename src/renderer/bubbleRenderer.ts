import vertSrc from '../shaders/bubble.vert?raw';
import fragSrc from '../shaders/bubble.frag?raw';
import { BUBBLE_AMOUNT, BUBBLE_SIZE_LARGE, BUBBLE_SIZE_MEDIUM, BUBBLE_SIZE_SMALL, BUBBLE_SIZE_TINY, BUBBLE_SIZE_MICRO, BUBBLE_SIZE_NANO } from '../core/constants';

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error('Bubble shader compile error: ' + gl.getShaderInfoLog(shader));
    return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vert));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error('Bubble program link error: ' + gl.getProgramInfoLog(program));
    return program;
}

export class BubbleRenderer {
    readonly canvas: HTMLCanvasElement;
    private gl:      WebGLRenderingContext;
    private program: WebGLProgram;

    private u_time:       WebGLUniformLocation;
    private u_resolution: WebGLUniformLocation;

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
            z-index: 2;
        `;

        const gl = this.canvas.getContext('webgl');
        if (!gl) throw new Error('WebGL not supported');
        this.gl = gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.program = createProgram(gl, vertSrc, fragSrc);
        gl.useProgram(this.program);

        gl.uniform1f(gl.getUniformLocation(this.program, 'u_noiseScale'), 1.0);
        gl.uniform3f(gl.getUniformLocation(this.program, 'u_colorBase'), 0.02, 0.08, 0.25);
gl.uniform3f(gl.getUniformLocation(this.program, 'u_colorIridescence'), 0.9, 1.3, 2.0);

        // Master bubble amount — scales all density layers together
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_amount'), BUBBLE_AMOUNT);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_sizeLarge'),  BUBBLE_SIZE_LARGE);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_sizeMedium'), BUBBLE_SIZE_MEDIUM);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_sizeSmall'),  BUBBLE_SIZE_SMALL);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_sizeTiny'),   BUBBLE_SIZE_TINY);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_sizeMicro'),  BUBBLE_SIZE_MICRO);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_sizeNano'),   BUBBLE_SIZE_NANO);

        const verts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        const a_pos = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(a_pos);
        gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

        this.u_time       = gl.getUniformLocation(this.program, 'u_time')!;
        this.u_resolution = gl.getUniformLocation(this.program, 'u_resolution')!;
        gl.uniform2f(this.u_resolution, width, height);
    }

    resize(width: number, height: number): void {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width  = width * dpr;
        this.canvas.height = height * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.u_resolution, width, height);
    }

    render(time: number): void {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(this.u_time, time);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    dispose(): void {
        this.gl.deleteProgram(this.program);
        this.canvas.remove();
    }
}