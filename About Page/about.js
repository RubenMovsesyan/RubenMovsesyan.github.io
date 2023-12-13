import { mat3 } from 'https://wgpu-matrix.org/dist/2.x/wgpu-matrix.module.js';

const canvas = document.querySelector('canvas');
const about = document.querySelector('#about');
const FRAME_INTERVAL = 5; // ms
const UPDATE_INTERVAL = 5; // ms
const SHIP_SCALE = 0.025;

const FRAME_BEZEL = 20;

const blurb = 'My name is Ruben Movsesyan and I am a graduate of Computer Engineering from the University of California at Santa Cruz. During my time in school I did a little bit of work in different fields of engineering and software development. The goal behind creating this website is to explore some of those topics in more depth and see what kinds of creations I can produce using said concepts. Some of the concepts that I am currently exploring are parallel programming and gpu programming. To do so I am using the WebGPU api for JavaScript. WebGPU is not yet supported on all browsers but it is supported on the latest version of chrome. And while there are many other ways to achieve graphics programming on the web that are compatible with all browsers, I have decided to use WebGPU because it is a developing technology and allows access to writing compute shaders, opening parallel computing to many more possibilities.';

canvas.width = window.innerWidth - FRAME_BEZEL;
canvas.height = window.innerHeight - 6 * FRAME_BEZEL;

about.width = window.innerWidth - FRAME_BEZEL;
about.height = window.innerHeight - 6 * FRAME_BEZEL;

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

const ctx = about.getContext('2d');
ctx.font = '30px monospace'
// ctx.fillText(blurb, 10, 30);
var lines = getLines(ctx, blurb, about.width);
for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 10, (i + 1) * 30);
}

// Setup WebGPU -----------------------------------------------------

if (!navigator.gpu) {
    throw new Error('WebGPU not supported on this browser');
}

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
    throw new Error('No appropriate GPUAdapter found.');
}

const device = await adapter.requestDevice();
if (!device) {
    throw new Error('No appropriate GPUDevice found.');
}

// configuring the cavnas
canvas.style.webkitFilter = 'blur(3px)';
const context = canvas.getContext('webgpu');
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
    device: device,
    format: canvasFormat,
    alphaMode: 'premultiplied',
});

// Setup WebGPU -----------------------------------------------------

// Setup scene ------------------------------------------------------

const shipVertexSize = 8;

const shipVertexArray = new Float32Array([
    // Left side
     0.0,  1.0,
    -0.5, -1.0,
     0.0, -1.0,

    // Right side
     0.0,  1.0,
     0.0, -1.0,
     0.5, -1.0,
]);

const shipVertexBuffer = device.createBuffer({
    label: 'Ship vertices',
    size: shipVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(shipVertexBuffer, 0, shipVertexArray);

const shipVertexBufferLayout = {
    arrayStride: 8,
    attributes: [{
        format: 'float32x2',
        offset: 0,
        shaderLocation: 0, // Position, see vertex shader
    }]
}

var forcePoint = {
    x: 0,
    y: 0,
};

// Setup scene ------------------------------------------------------

// Setup Uniforms ---------------------------------------------------

const transformationUniformBufferSize = 4 * 12;
const transformationUniformBuffer = device.createBuffer({
    label: 'transformation uniform buffer',
    size: transformationUniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const shipPosition = new Float32Array(2);
shipPosition[0] = 0;
shipPosition[1] = 0;

const shipPositionBuffer = device.createBuffer({
    label: 'ship position',
    size: shipPosition.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(shipPositionBuffer, 0, shipPosition);

const shipDirection = new Float32Array(2);
shipDirection[0] = 0;
shipDirection[1] = 1;

const shipDirectionBuffer = device.createBuffer({
    label: 'ship direction',
    size: shipDirection.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(shipDirectionBuffer, 0, shipDirection);

// Setup Uniforms ---------------------------------------------------

// Setup pipeline ---------------------------------------------------

const bindGroupLayout = device.createBindGroupLayout({
    label: 'bind group layout',
    entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {},
    },
    {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'read-only-storage' }, // ship position
    },
    {
        binding: 2,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'read-only-storage' }, // ship direction
    }]
});

const bindGroup = device.createBindGroup({
    label: 'bind group',
    layout: bindGroupLayout,
    entries: [{
        binding: 0,
        resource: {
            buffer: transformationUniformBuffer,
        }
    },
    {
        binding: 1,
        resource: {
            buffer: shipPositionBuffer,
        }
    },
    {
        binding: 2,
        resource: {
            buffer: shipDirectionBuffer,
        }
    }]
});

const pipelineLayout = device.createPipelineLayout({
    label: 'pipeline layout',
    bindGroupLayouts: [ bindGroupLayout ],
});

const pipeline = device.createRenderPipeline({
    label: 'pipeline',
    layout: pipelineLayout,
    vertex: {
        module: device.createShaderModule({
            label: 'vertex shader',
            code: vertShader,
        }),
        entryPoint: 'main',
        buffers: [ shipVertexBufferLayout ],
    },
    fragment: {
        module: device.createShaderModule({
            label: 'fragment shader',
            code: fragShader
        }),
        entryPoint: 'main',
        targets: [{
            format: canvasFormat
        }],
    },
    primitive: {
        topology: 'triangle-list',
        cullMode: 'back',
    },
});

const renderPassDescriptor = {
    label: 'render pass descriptor',
    colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { // #3CE8E8
            // r: 0.234375,
            // g: 0.90625,
            // b: 0.90625,
            r: 11.0 / 256.0,
            g: 91.0 / 256.0,
            b: 91.0 / 256.0,
            a: 1.0,
        },
        loadOp: 'clear',
        storeOp: 'store',
    }]
}

// Setup pipeline ---------------------------------------------------

// Set global transformations for ship ------------------------------

function getGlobalTransformationMatrix() {
    const now = Date.now() / 1000;
    var modelViewProjectionMatrix = mat3.identity();
    const aspect = canvas.width / canvas.height;
    // const aspect = 1;
    // mat3.rotate(modelViewProjectionMatrix, now, modelViewProjectionMatrix);
    mat3.scale(modelViewProjectionMatrix, [SHIP_SCALE, aspect * SHIP_SCALE], modelViewProjectionMatrix);
    
    return modelViewProjectionMatrix;
}

// Set global transformations for ship ------------------------------

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    };
}

canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    forcePoint.x = (2 * (mousePos.x / canvas.width)) - 1;
    forcePoint.y = -((2 * (mousePos.y / canvas.height)) - 1);
    
    // shipPosition[0] = x;
    // shipPosition[1] = y;
    // device.queue.writeBuffer(shipPositionBuffer, 0, shipPosition);
}, false);

about.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(about, evt);
    forcePoint.x = (2 * (mousePos.x / about.width)) - 1;
    forcePoint.y = -((2 * (mousePos.y / about.height)) - 1);
    
    // shipPosition[0] = x;
    // shipPosition[1] = y;
    // device.queue.writeBuffer(shipPositionBuffer, 0, shipPosition);
}, false);

function normalize(vec, scale) {
    // let len = Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));

    // vec.x /= len;
    // vec.y /= len;

    vec.x *= scale;
    vec.y *= scale;
}

function update() {
    var shipPos = {
        x: shipPosition[0],
        y: shipPosition[1],
    };

    if (isNaN(shipPos.x)) {
        shipPos = {
            x: 0,
            y: 0,
        };
    }

    var forceVec = {
        x: shipPos.x - forcePoint.x,
        y: shipPos.y - forcePoint.y,
    }

    shipDirection[0] = -forceVec.x;
    shipDirection[1] = -forceVec.y;

    device.queue.writeBuffer(shipDirectionBuffer, 0, shipDirection);

    normalize(forceVec, -0.025);

    shipPos.x += forceVec.x;
    shipPos.y += forceVec.y;


    shipPosition[0] = shipPos.x;
    shipPosition[1] = shipPos.y;

    device.queue.writeBuffer(shipPositionBuffer, 0, shipPosition);
}

function frame() {
    var gloablTransformationMatrix = getGlobalTransformationMatrix();
    device.queue.writeBuffer(transformationUniformBuffer, 0, gloablTransformationMatrix);


    // keep this line in or it doesn't work
    renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setVertexBuffer(0, shipVertexBuffer);
    passEncoder.draw(shipVertexArray.length / 2, 2);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
}

setInterval(frame, FRAME_INTERVAL);
setInterval(update, UPDATE_INTERVAL);