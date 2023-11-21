"use strict";

var canvas;
var gl;

var NumVertices = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];

var scale = 1.0;

var thetaLoc;
var scaleLoc;
var stop = true;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);


    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    scaleLoc = gl.getUniformLocation(program, "scale");

    //event listeners for buttons
    document.getElementById("xButton").onclick = function() {
        axis = xAxis;
        stop = false;
    };
    document.getElementById("yButton").onclick = function() {
        axis = yAxis;
        stop = false;
    };
    document.getElementById("zButton").onclick = function() {
        axis = zAxis;
        stop = false;
    };
    document.getElementById("reset").onclick = function() {
        stop = true;
        axis = 0;
        theta = [0, 0, 0];
    };
    document.getElementById("grow").onclick = function() {
        scale = scale * 2;
    };
    document.getElementById("shrink").onclick = function() {
        scale = scale / 2;
    };

    render();
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-0.25, -0.25, 0.25, 1.0),
        vec4(-0.25, 0.25, 0.25, 1.0),
        vec4(0.25, 0.25, 0.25, 1.0),
        vec4(0.25, -0.25, 0.25, 1.0),
        vec4(-0.25, -0.25, -0.25, 1.0),
        vec4(-0.25, 0.25, -0.25, 1.0),
        vec4(0.25, 0.25, -0.25, 1.0),
        vec4(0.25, -0.25, -0.25, 1.0)
    ];

    var vertexColors = [
        [1.0, 0.0, 0.0, 1.0], // red
        [1.0, 1.0, 0.0, 1.0], // yellow
        [0.0, 1.0, 0.0, 1.0], // green
        [0.0, 0.0, 1.0, 1.0], // blue
        [1.0, 0.0, 1.0, 1.0], // magenta
        [0.0, 1.0, 1.0, 1.0], // cyan
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a - 1]);

    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!stop)
        //we start with a still cube using the 'stop' variable 
        theta[axis] += 1.0;

    gl.uniform3fv(thetaLoc, theta);
    gl.uniform1f(scaleLoc, scale);

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    requestAnimFrame(render);
}
