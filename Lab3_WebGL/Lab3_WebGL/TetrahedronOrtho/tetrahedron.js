"use strict";

var canvas;
var gl;

var numVertices = 12;

var pointsArray = [];
var colorsArray = [];


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

var near = -1;
var far = 1;
var radius = 0.5;
var theta = 0.0;
var phi = 0.0;
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, .0);


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
    //console.log(pointsArray);
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

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    tethraedron();

    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // sliders for viewing parameters

    document.getElementById("depthSlider").onchange = function(event) {
        far = event.target.value / 2;
        near = -event.target.value / 2;
    };
    document.getElementById("widthSlider").onchange = function(event) {
        right = event.target.value / 2;
        left = -event.target.value / 2;
    };
    document.getElementById("heightSlider").onchange = function(event) {
        ytop = event.target.value / 2;
        bottom = -event.target.value / 2;
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

    render();
}


var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    //console.log(eye,at,up);
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame(render);
}