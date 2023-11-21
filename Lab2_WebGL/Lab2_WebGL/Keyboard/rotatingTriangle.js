"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertices = new Float32Array([-0.25, -0.144,
        0.0, 0.289,
        0.25, -0.144
    ]);

    var colors = new Float32Array([
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0
    ]);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    var colorbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vColor);

    thetaLoc = gl.getUniformLocation(program, "theta");


    window.addEventListener('keydown', function(e) {
        if (e.key == 'ArrowUp') {
            console.log(`Key "${e.key}" pressed  [event: keydown]`);
            theta -= 0.1;
            gl.uniform1f(thetaLoc, theta);
        }
        // Your Code Here
        if(e.key=='ArrowDown') {
            console.log(`Key "${e.key}" pressed  [event: keydown]`);
            theta += 0.1;
            gl.uniform1f(thetaLoc, theta);
        }
        if(e.key=='Enter') {
            console.log(`Key "${e.key}" pressed  [event: keydown]`);
            theta = 0;
            gl.uniform1f(thetaLoc, theta);
        }

        if(e.key=='r') {
            
            console.log(`Key "${e.key}" pressed  [event: keydown]`);
            theta = 0;
            gl.uniform1f(thetaLoc, theta);
        }


    });

    render();
};


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);

    window.requestAnimFrame(render);
}