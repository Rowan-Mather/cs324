"use strict";

var canvas;
var gl;

var NumVertices = 36;

var pointsArray = [];
var colorsArray = [];

var near = 0.1;
var far = 5.0;
var radius = 0.95;
var theta = 0.0 * Math.PI / 180.0; // degrees to radians conversion
var phi = 10.0 * Math.PI / 180.0; // degrees to radians conversion


var fovy = 60.0; // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0; // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


var vertices = [
    vec4(0.0, 0.0, 0.5, 1.0),
    vec4(-0.4, -0.25, -0.5, 1.0),
    vec4(0.4, -0.25, -0.5, 1.0),
    vec4(0.0, 0.50, -0.5, 1.0)

];

// Colors in RGB
var red = vec4(1.0, 0.0, 0.0, 1.0);
var green = vec4(0.0, 1.0, 0.0, 1.0);
var blue = vec4(0.0, 0.0, 1.0, 1.0);
var purple = vec4(1.0, 0.0, 1.0, 1.0);


function triangle(a, b, c, colour) {
    // colour for each face is picked according to the first vertex index
    // you could pick any colour  
    // Create 4 triangles

    pointsArray.push(vertices[a]);
    colorsArray.push(colour);
    pointsArray.push(vertices[b]);
    colorsArray.push(colour);
    pointsArray.push(vertices[c]);
    colorsArray.push(colour);
    console.log(pointsArray);
}


function tethraedron() {
    triangle(2, 1, 3, green);
    triangle(3, 1, 0, blue);
    triangle(0, 1, 2, red);
    triangle(0, 2, 3, purple);

}


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    tethraedron();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // sliders for viewing parameters

    document.getElementById("FarSlider").onchange = function(event) {
        far = event.target.value;
    };
    document.getElementById("NearSlider").onchange = function(event) {
        near = event.target.value;
    };
    document.getElementById("radiusSlider").onchange = function(event) {
        radius = event.target.value;
    };
    document.getElementById("thetaSlider").onchange = function(event) {
        theta = event.target.value * Math.PI / 180.0;
    };
    document.getElementById("phiSlider").onchange = function(event) {
        phi = event.target.value * Math.PI / 180.0;
    };

    document.getElementById("fovSlider").onchange = function(event) {
        fovy = event.target.value;
    };
    document.getElementById("aspectSlider").onchange = function(event) {
        aspect = event.target.value;
    };

    render();
}


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);

    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    requestAnimFrame(render);
}