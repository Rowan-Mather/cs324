var gl;
var points;

function main() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }


    var vertices = new Float32Array([-0.6, -0.6,
        0, 0.6,
        0.6, -0.6
    ]);

    var colors = new Float32Array([1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ]);

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    var colorbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vColor);
    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // draw a triangles starting from index 0 and 
    // using 3 indices 
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}