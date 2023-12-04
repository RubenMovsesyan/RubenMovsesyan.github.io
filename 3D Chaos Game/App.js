// Vertex Shader source
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotationMatrix;
    uniform float a_size;

    void main() {
        gl_Position = u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
        gl_PointSize = a_size;
    }
`;

// Fragment shader source
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;

    void main() {
        gl_FragColor = u_FragColor;
    }
`;

const color_1 = [255 / 255, 0 / 255, 0/ 255, 1.0];      // a - red
const color_2 = [0 / 255, 255 / 255, 0/ 255, 1.0];      // b - green
const color_3 = [0 / 255, 0 / 255, 255/ 255, 1.0];      // c - blue
const color_4 = [255 / 255, 255 / 255, 0/ 255, 1.0];    // d - yellow
const color_5 = [0 / 255, 255 / 255, 255/ 255, 1.0];    // e - cyan

const rotation = [0, 0, 0];
const translation = [-0.25, -0.5, -0.25];
const scale = [0.5, 1, 0.5];

var canvas;
var gl;
var a_Position;
var a_size;
var u_FragColor;
var u_ModelMatrix;
var u_GlobalRotationMatrix;
var g_globalAngle = 0;
var shapes = [];

var g_seconds;
var g_start_time = performance.now() / 1000.0;

// initial chaos points
var p_a, p_b, p_c, p_d, p_e;
var x, y, z;

// Set up webgl and get the context from the canvas
function setupWebGL() {
    // Retrieve canvas
    canvas = document.getElementById('chaos');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", function() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    });

    // Get the rendering context
    gl = canvas.getContext('webgl', {preservDrawingBuffer: true});

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    // Get the storage location of the attribute variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (u_ModelMatrix < 0) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotationMatrix');
    if (u_GlobalRotationMatrix < 0) {
        console.log('Failed to the storage location of u_GlobalRotationMatrix');
        return;
    }

    a_size = gl.getUniformLocation(gl.program, 'a_size');
    if (a_size < 0) {
        console.log('Failed to get the storage location of a_size');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function createPointWithTransform(verticies, size, color, rotation, translation, scale) {
    [x, y, z] = verticies;
    [r_x, r_y, r_z] = rotation;
    [t_x, t_y, t_z] = translation;
    [s_x, s_y, s_z] = scale;

    var point = new Point(x, y, z, size, color);
    point.matrix.rotate(r_x, r_y, r_z);
    point.matrix.translate(t_x, t_y, t_z);
    point.matrix.scale(s_x, s_y, s_z);

    return point;
}

function createPathWithTransform(v1, v2, weight, color, rotation, translation, scale) {
    [r_x, r_y, r_z] = rotation;
    [t_x, t_y, t_z] = translation;
    [s_x, s_y, s_z] = scale;

    var path = new Path(v1, v2, weight, color);
    path.matrix.rotate(r_x, r_y, r_z);
    path.matrix.translate(t_x, t_y, t_z);
    path.matrix.scale(s_x, s_y, s_z);

    return path;
}

function createCubeWithTransform(origin, size, color, rotation, translation, scale) {
    [r_x, r_y, r_z] = rotation;
    [t_x, t_y, t_z] = translation;
    [s_x, s_y, s_z] = scale;

    var cube = new Cube(origin, size, color);
    cube.matrix.rotate(r_x, r_y, r_z);
    cube.matrix.translate(t_x, t_y, t_z);
    cube.matrix.scale(s_x, s_y, s_z);

    return cube;
}

function setupVars() {
    // p_a = [(2 * Math.random()) - 1, (2 * Math.random()) - 1, (2 * Math.random()) - 1];
    // p_b = [(2 * Math.random()) - 1, (2 * Math.random()) - 1, (2 * Math.random()) - 1];
    // p_c = [(2 * Math.random()) - 1, (2 * Math.random()) - 1, (2 * Math.random()) - 1];
    // p_d = [(2 * Math.random()) - 1, (2 * Math.random()) - 1, (2 * Math.random()) - 1];
    // p_e = [(2 * Math.random()) - 1, (2 * Math.random()) - 1, (2 * Math.random()) - 1];

    p_a = [Math.random(), 1, Math.random()];
    p_b = [(0.5 * Math.random()) + 0.5, 0, (0.5 * Math.random()) + 0.5];
    p_c = [(0.5 * Math.random()) + 0.5, 0, 0];
    p_d = [(0.5 * Math.random()), 0, (0.5 * Math.random())];
    p_e = [(0.5 * Math.random()), 0, (0.5 * Math.random()) + 0.5];

    x = p_a[0];
    y = p_a[1];
    z = p_a[2];

    // shapes.push(new Cube([0, 0, 0], [1, 1, 1], [0, 1, 0, 1]));
    // shapes.push(createCubeWithTransform([0, 0, 0], [1, 1, 1], [0, 1, 0, 1], rotation, translation, scale));

    shapes.push(createPathWithTransform(p_a, p_b, 1, color_1, rotation, translation, scale));
    shapes.push(createPathWithTransform(p_a, p_c, 1, color_2, rotation, translation, scale));
    shapes.push(createPathWithTransform(p_a, p_d, 1, color_3, rotation, translation, scale));
    shapes.push(createPathWithTransform(p_a, p_e, 1, color_4, rotation, translation, scale));
    shapes.push(createPathWithTransform(p_b, p_c, 1, color_2, rotation, translation, scale));
    shapes.push(createPathWithTransform(p_c, p_d, 1, color_3, rotation, translation, scale));
    shapes.push(createPathWithTransform(p_d, p_e, 1, color_4, rotation, translation, scale));
    shapes.push(createPathWithTransform(p_e, p_b, 1, color_5, rotation, translation, scale));

    shapes.push(createPointWithTransform(p_a, 10, color_1, rotation, translation, scale))
    shapes.push(createPointWithTransform(p_b, 10, color_2, rotation, translation, scale))
    shapes.push(createPointWithTransform(p_c, 10, color_3, rotation, translation, scale))
    shapes.push(createPointWithTransform(p_d, 10, color_4, rotation, translation, scale))
    shapes.push(createPointWithTransform(p_e, 10, color_5, rotation, translation, scale))
}

function setupPoints() {
    for (let i = 0; i < 10000; i++) {
        let choice = Math.floor(5 * Math.random());
        let percent = 0.5;
        let color = [1.0, 0.0, 105.0 / 255.0, 1.0];

        switch (choice) {
            case 0:
                color = color_1;
                x = lerp(x, p_a[0], percent);
                y = lerp(y, p_a[1], percent);
                z = lerp(z, p_a[2], percent);
                break;
            case 1:
                color = color_2;
                x = lerp(x, p_b[0], percent);
                y = lerp(y, p_b[1], percent);
                z = lerp(z, p_b[2], percent);
                break;
            case 2:
                color = color_3;
                x = lerp(x, p_c[0], percent);
                y = lerp(y, p_c[1], percent);
                z = lerp(z, p_c[2], percent);
                break;
            case 3:
                color = color_4;
                x = lerp(x, p_d[0], percent);
                y = lerp(y, p_d[1], percent);
                z = lerp(z, p_d[2], percent);
                break;
            case 4:
                color = color_5;
                x = lerp(x, p_e[0], percent);
                y = lerp(y, p_e[1], percent);
                z = lerp(z, p_e[2], percent);
                break;
        }

        // shapes.push(new Point(x, y, z, 2, color));
        shapes.push(createPointWithTransform([x, y, z], 2, color, rotation, translation, scale))
    }
}


function renderAllShapes() {
    // Set the color for clearing the canvas
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, globalRotMat.elements);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < shapes.length; i++) {
        shapes[i].render();
    }
}

function tick() {
    g_seconds = performance.now() / 1000.0 - g_start_time
    // console.log(g_seconds);

    if (g_globalAngle >= 360) {
        g_globalAngle = 0;
    } else {
        g_globalAngle++;
    }

    renderAllShapes();

    requestAnimationFrame(tick);
}

// Main entrance function
function main() {
    setupWebGL();
    connectVariablesToGLSL();
    setupVars();
    setupPoints();
    renderAllShapes();
    requestAnimationFrame(tick);
}