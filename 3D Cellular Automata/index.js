const canvas = document.querySelector('canvas');

var step = 0;
const UPDATE_INTERVAL = 125; // ms
const FRAME_INTERVAL = 5;
const WORKGROUP_SIZE = 4;
const GRID_SIZE = 40;
// const GRID_SIZE = 4;
const SCALE = 0.6 / GRID_SIZE;
const GEN_PERCENT = 0.7;

const FRAME_BEZEL = 20;

canvas.width = window.innerWidth - FRAME_BEZEL;
canvas.height = window.innerHeight - 4 *FRAME_BEZEL;

var aspect = canvas.width / canvas.height;
var projection_matrix = new Matrix4();

projection_matrix.setPerspective(
    50, 
    aspect, 
    0.5, 
    1000
);

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth - FRAME_BEZEL;
    canvas.height = window.innerHeight - 4 * FRAME_BEZEL;

    aspect = canvas.width / canvas.height;
    projection_matrix = new Matrix4();

    projection_matrix.setPerspective(
        50, 
        aspect, 
        0.5, 
        1000
    );

    depth_texture = device.createTexture({
        label: 'depth texture',
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
});


// Setup WebGPU ------------------------------------------------
// check if webgpu is supported
if (!navigator.gpu) {
    throw new Error('WebGPU not supported on this browser.');
}

// request and adapter and device
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
    throw new Error('No appropriate GPUAdapter found.');
}

// device is the main interface through which most interaction with the GPU happens
const device = await adapter.requestDevice();
if (!device) {
    throw new Error('No appropriate GPUDevice found.');
}

// configuring the canvas
const context = canvas.getContext('webgpu');
const canvas_format = navigator.gpu.getPreferredCanvasFormat();
context.configure({
    device: device,
    format: canvas_format,
    alphaMode: 'premultiplied',
});



// Setup WebGPU ------------------------------------------------


// Passing all the information to the GPU ----------------------
let cube = new Cube(0.8);

const vertex_buffer = device.createBuffer({
    label: 'Cube vertices',
    size: cube.cube_vertex_array.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertex_buffer, 0, cube.cube_vertex_array);

const grid_uniform_array = new Float32Array([GRID_SIZE, GRID_SIZE, GRID_SIZE]);
const grid_uniform_buffer = device.createBuffer({
    label: 'grid uniforms',
    size: grid_uniform_array.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(grid_uniform_buffer, 0, grid_uniform_array);

const cell_state_array = new Uint32Array(GRID_SIZE * GRID_SIZE * GRID_SIZE);

const cell_state_storage = [
    device.createBuffer({
        label: 'cell state a',
        size: cell_state_array.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
    device.createBuffer({
        label: 'cell state b',
        size: cell_state_array.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
];

for (let i = 0; i < cell_state_array.length; i++) {
    cell_state_array[i] = Math.random() > GEN_PERCENT ? 1 : 0;
}

// for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
//     cell_state_array[i] = Math.random() > 0.8 ? 1 : 0;
// }

// for (let i = 0; i < cell_state_array.length; i++) {
//     if (i % 6 == 0) {
//         cell_state_array[i] = 1;
//     } else {
//         cell_state_array[i] = 0;
//     }
// }

device.queue.writeBuffer(cell_state_storage[0], 0, cell_state_array);

for (let i = 0; i < cell_state_array.length; i++) {
    cell_state_array[i] = 0;
}

device.queue.writeBuffer(cell_state_storage[1], 0, cell_state_array);

// Passing all the information to the GPU ----------------------

const uniform_buffer_size = 4 * 16; // 4x4 matrix
const uniform_buffer = device.createBuffer({
    label: 'uniform buffer',
    size: uniform_buffer_size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

// Bind groups
const bind_group_layout = device.createBindGroupLayout({
    label: 'bind group layout',
    entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {},
    },
    {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: {}
    },
    {
        binding: 2,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
        buffer: { type: 'read-only-storage' }, // cell state in
    },
    {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: 'storage' }, // cell state out
    }
    ]
});

const bind_group = [
    device.createBindGroup({
        label: 'bind group a',
        layout: bind_group_layout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniform_buffer,
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: grid_uniform_buffer,
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: cell_state_storage[0],
                }
            },
            {
                binding: 3,
                resource: {
                    buffer: cell_state_storage[1],
                }
            }
        ]
    }),
    device.createBindGroup({
        label: 'bind group b',
        layout: bind_group_layout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniform_buffer,
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: grid_uniform_buffer,
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: cell_state_storage[1],
                }
            },
            {
                binding: 3,
                resource: {
                    buffer: cell_state_storage[0],
                }
            }
        ]
    })
];

const pipeline_layout = device.createPipelineLayout({
    label: 'pipeline layout',
    bindGroupLayouts: [ bind_group_layout ],
})

const pipeline = device.createRenderPipeline({
    label: 'pipeline',
    layout: pipeline_layout,
    vertex: {
        module: device.createShaderModule({
            label: 'vertex shader',
            code: vert_shader,
        }),
        entryPoint: 'main',
        buffers: [{
            arrayStride: cube.cube_vertex_size,
            attributes: [{
                // position
                shaderLocation: 0,
                offset: 0,
                format: 'float32x3'
            },
            ],
        },
        ],
    },
    fragment: {
        module: device.createShaderModule({
            label: 'fragment shader',
            code: frag_shader,
        }),
        entryPoint: 'main',
        targets: [
            {
                format: canvas_format,
            },
        ],
    },
    primitive: {
        topology: 'triangle-list',
        
        // Backface culling since the cube is solid piece of geometry.
        // Faces pointing away from the camera will be occluded by faces
        // pointing toward the camera.
        cullMode: 'back',
    },

    // Enable depth testing so that the fragment closest to the camera
    // is rendered in front.
    depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
    },
});

const simulation_pipeline = device.createComputePipeline({
    label: 'simulation pipeline',
    layout: pipeline_layout,
    compute: {
        module: device.createShaderModule({
            label: 'simulation shader',
            code: comp_shader,
        }),
        entryPoint: 'main'
    }
})

var depth_texture = device.createTexture({
    label: 'depth texture',
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
});

const render_pass_descriptor = {
    label: 'render pass descriptor',
    colorAttachments: [
        {
            view: undefined, // assigned later
            
            clearValue: {
                r: 0.2,
                g: 0.2,
                b: 0.2,
                a: 1.0,
            },
            loadOp: 'clear',
            storeOp: 'store',
        },
    ],
    depthStencilAttachment: {
        view: depth_texture.createView(),

        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
    },
};



function getTransformationMatrix() {
    const now = Date.now() / 1000;
    var model_view_projection_matrix = new Matrix4();
    model_view_projection_matrix.setIdentity();


    // model_view_projection_matrix.translate(x, -0.5, z);
    model_view_projection_matrix.translate(0, 0, -2.5);
    var scale_matrix = new Matrix4();
    
    scale_matrix.setScale(SCALE, SCALE, SCALE);
    // model_view_projection_matrix.rotate(
    //     57, // angle
    //     // 0,
    //     Math.sin(now), // axis
    //     Math.cos(now),
    //     0
    // );

    // console.log(now);
    model_view_projection_matrix.rotate(
        -((now * 180) / Math.PI),
        1,
        1,
        1
    );
    
    var p_mat = new Matrix4(projection_matrix);
    p_mat.multiply(model_view_projection_matrix);
    p_mat.multiply(scale_matrix);

    return p_mat; 
}

function update() {
    const command_encoder = device.createCommandEncoder();
    
    const compute_pass = command_encoder.beginComputePass();
    compute_pass.setPipeline(simulation_pipeline);
    compute_pass.setBindGroup(0, bind_group[step % 2]);
    const workgroup_count = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
    compute_pass.dispatchWorkgroups(workgroup_count, workgroup_count, workgroup_count);
    compute_pass.end();

    device.queue.submit([command_encoder.finish()]);

    step++;
}

function frame() {
    var transformation_matrix = getTransformationMatrix();
    device.queue.writeBuffer(uniform_buffer, 0, transformation_matrix.elements);
    render_pass_descriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
    
    const command_encoder = device.createCommandEncoder();

    const pass_encoder = command_encoder.beginRenderPass(render_pass_descriptor);
    pass_encoder.setPipeline(pipeline);
    pass_encoder.setBindGroup(0, bind_group[step % 2]);
    pass_encoder.setVertexBuffer(0, vertex_buffer);
    pass_encoder.draw(cube.cube_vertex_count, GRID_SIZE * GRID_SIZE * GRID_SIZE);
    pass_encoder.end();
    device.queue.submit([command_encoder.finish()]);
}

setInterval(frame, FRAME_INTERVAL);
setInterval(update, UPDATE_INTERVAL);