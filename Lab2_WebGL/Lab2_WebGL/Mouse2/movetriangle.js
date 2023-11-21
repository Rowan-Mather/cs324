var gl;
var x;
var y;
var m_Increment; // variable to hold the mouse increment


function main() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    var vertices = new Float32Array([-0.25, -0.25,
        0, 0.25,
        0.25, -0.25
    ]);

    //  Variable to hold the mouse coordinates                       
    var mousePos = new Float32Array([0, 0]);

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

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    m_Increment = gl.getUniformLocation(program, "mIncrement");


    canvas.addEventListener('mousedown', function(e) {

        console.log('Canvas coordinates: mouse x:' + x + ' mouse y:' + y);
        x = e.clientX;
        y = e.clientY;
        var rect = e.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

        console.log('WebGL coordinates mouse x:' + x + ' mouse y:' + y);
        // Your Code Here 
        //gl.uniform4f(m_Increment, x, y, 0);
        
        gl.vertexAttrib3f(vPosition, x, y, 0.0);
        gl.uniform4f(vPosition, x, y, 0);
        
        mousePos[0] = x;
        mousePos[1] = y;


        render();
    });

    render();
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // draw a triangles starting from index 0 and 
    // using 3 indices
    //****Change CODE HERE */ 
    gl.drawArrays(gl.LINE_LOOP, 0, 3);
    window.requestAnimFrame(render);
}