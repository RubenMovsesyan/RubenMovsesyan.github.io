import { vec3, mat3 } from 'https://wgpu-matrix.org/dist/2.x/wgpu-matrix.module.js';

const canvas = document.querySelector('canvas');

const NUM_BOIDS = 4000;
const BOID_SCALE = 0.005;
const FRAME_INTERVAL = 5; //ms
const UPDATE_INTERVAL = 5; //ms
const WORKGROUP_SIZE = 64;

const FRAME_BEZEL = 20;

canvas.width = window.innerWidth - FRAME_BEZEL;
canvas.height = window.innerHeight - FRAME_BEZEL;

var step = 0;

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
const context = canvas.getContext('webgpu');
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
    device: device,
    format: canvasFormat,
    alphaMode: 'premultiplied',
});

// Setup WebGPU -----------------------------------------------------

// Setup scene ------------------------------------------------------

const boidVertexSize = 8;
const boidVertexCount = 3 * boidVertexSize;

const boidVertexArray = new Float32Array([
    // Left side
     0.0,  1.0,
    -0.5, -1.0,
     0.0, -0.75,

    // Right side
     0.0,  1.0,
     0.0, -0.75,
     0.5, -1.0,
]);

const boidVertexBuffer = device.createBuffer({
    label: 'Boid vertices',
    size: boidVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(boidVertexBuffer, 0, boidVertexArray);

const boidVertexBufferLayout = {
    arrayStride: 8,
    attributes: [{
        format: 'float32x2',
        offset: 0,
        shaderLocation: 0, // Position, see vertex shader
    }]
}

// Setup scene ------------------------------------------------------

// Setup Uniforms ---------------------------------------------------

// 3x3 matrix is actually 3x4 so size must be 4 x 12
const transformationUniformBufferSize = 4 * 12;
const transformationUniformBuffer = device.createBuffer({
    label: 'transformation uniform buffer',
    size: transformationUniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

// Boid positions array
const boidPositions = new Float32Array(2 * NUM_BOIDS);
for (let i = 0; i < 2 * NUM_BOIDS; i++) {
    boidPositions[i] = (2 * Math.random()) - 1;
}

const boidPositionsBuffers = [
    device.createBuffer({
        label: 'boid positions in',
        size: boidPositions.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
    device.createBuffer({
        label: 'boid positions out',
        size: boidPositions.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
];

device.queue.writeBuffer(boidPositionsBuffers[0], 0, boidPositions);
device.queue.writeBuffer(boidPositionsBuffers[1], 0, boidPositions);

// Boid directions array
const boidDirections = new Float32Array(2 * NUM_BOIDS);
// for (let i = 0; i < 2 * NUM_BOIDS; i++) {
//     boidDirections[i] = (0.001 * Math.random()) + 0.001;
// }
for (let i = 0; i < 2 * NUM_BOIDS; i++) {
    boidDirections[i] = (0.002 * Math.random()) - 0.001;
}

const boidDirectionsBuffers = [
    device.createBuffer({
        label: 'boid directions in',
        size: boidDirections.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
    device.createBuffer({
        label: 'boid directions out',
        size: boidDirections.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
];

device.queue.writeBuffer(boidDirectionsBuffers[0], 0, boidDirections);
device.queue.writeBuffer(boidDirectionsBuffers[1], 0, boidDirections);

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
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: { type: 'read-only-storage' }, // boid positions in
    },
    {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: 'storage' }, // boid positions out
    },
    {
        binding: 3,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: { type: 'read-only-storage' }, // boid directions in
    },
    {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: 'storage' }, // boid directions out
    }],
});

// Input and output bind groups
const bindGroups = [
    device.createBindGroup({
        label: 'bind group a',
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
                buffer: boidPositionsBuffers[0],
            }
        },
        {
            binding: 2,
            resource: {
                buffer: boidPositionsBuffers[1],
            }
        }, 
        {
            binding: 3,
            resource: {
                buffer: boidDirectionsBuffers[0],
            }
        },
        {
            binding: 4,
            resource: {
                buffer: boidDirectionsBuffers[1],
            }
        }]
    }),
    device.createBindGroup({
        label: 'bind group b',
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
                buffer: boidPositionsBuffers[1],
            }
        },
        {
            binding: 2,
            resource: {
                buffer: boidPositionsBuffers[0],
            }
        }, 
        {
            binding: 3,
            resource: {
                buffer: boidDirectionsBuffers[1],
            }
        },
        {
            binding: 4,
            resource: {
                buffer: boidDirectionsBuffers[0],
            }
        }]
    }),
];

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
            code: vertShader
        }),
        entryPoint: 'main',
        buffers: [ boidVertexBufferLayout ],
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

        // Backface culling since the boid 2D.
        // Faces pointing away from the camera will be occluded by faces
        // pointing toward the camera.
        cullMode: 'back',
    },
});

const renderPassDescriptor = {
    label: 'render pass descriptor',
    colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: {
            r: 0.2,
            g: 0.2,
            b: 0.2,
            a: 1.0,
        },
        loadOp: 'clear',
        storeOp: 'store',
    }]
}

// Setup pipeline ---------------------------------------------------

// Setup Compute pipeline -------------------------------------------

const computePipeline = device.createComputePipeline({
    label: 'compute pipeline',
    layout: pipelineLayout,
    compute: {
        module: device.createShaderModule({
            label: 'compute shader',
            code: compShader
        }),
        entryPoint: 'main',
    }
});

// Setup Compute pipeline -------------------------------------------

// Set global transformations for all boids -------------------------

function getGlobalTransformationMatrix() {
    const now = Date.now() / 1000;
    var modelViewProjectionMatrix = mat3.identity();
    const aspect = canvas.width / canvas.height;
    // const aspect = 1;
    // mat3.rotate(modelViewProjectionMatrix, now, modelViewProjectionMatrix);
    mat3.scale(modelViewProjectionMatrix, [BOID_SCALE, aspect * BOID_SCALE], modelViewProjectionMatrix);
    
    return modelViewProjectionMatrix;
}

// Set global transformations for all boids -------------------------

function update() {
    const commandEncoder = device.createCommandEncoder();

    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(computePipeline);
    computePass.setBindGroup(0, bindGroups[step % 2]);
    const workgroupCount = Math.ceil(NUM_BOIDS / WORKGROUP_SIZE);
    computePass.dispatchWorkgroups(workgroupCount);
    computePass.end();

    device.queue.submit([commandEncoder.finish()]);

    step++;
}

function frame() {
    var gloablTransformationMatrix = getGlobalTransformationMatrix();
    device.queue.writeBuffer(transformationUniformBuffer, 0, gloablTransformationMatrix);


    // keep this line in or it doesn't work
    renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroups[step % 2]);
    passEncoder.setVertexBuffer(0, boidVertexBuffer);
    passEncoder.draw(boidVertexArray.length / 2, NUM_BOIDS);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
}

setInterval(frame, FRAME_INTERVAL);
setInterval(update, UPDATE_INTERVAL);