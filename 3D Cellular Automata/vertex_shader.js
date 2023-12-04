const vert_shader = /*wgsl*/`

struct Uniforms {
    modelViewProjectionMatrix: mat4x4<f32>,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;
@binding(1) @group(0) var<uniform> grid: vec3f;
@binding(2) @group(0) var<storage> cell_state: array<u32>;

struct VertexOutput {
    @builtin(position) Position: vec4<f32>,
    @location(0) fragPosition: vec4<f32>,
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @builtin(instance_index) instance: u32
) -> VertexOutput {
    
    // let i = f32(instance);
    // let i_x = i % grid.x;
    // let i_y = floor(i / grid.y);
    // let i_z = i % grid.z;

    // let cell = vec3f(i_x, i_y, i_z);
    // let state = f32(cell_state[instance]);

    // let cell_offset = cell / grid * 2;
    // let grid_pos = (position * state + 1) / grid - 1 + cell_offset;

    let i = f32(instance);
    // let i_x = i % grid.x;
    // let i_y = floor(i / grid.y) % grid.y;
    // let i_z = floor(i / (grid.z * grid.y));

    let i_x = (i % grid.x) - ((grid.x / 2) - 0.5);
    // let i_x = (i % grid.x);
    let i_y = (floor(i / grid.y) % grid.y) - ((grid.y / 2) - 0.5);
    let i_z = (floor(i / (grid.x * grid.y)) % grid.z) - ((grid.z / 2) - 0.5);
    // let i_z = (floor(i / (grid.x * grid.y)) % grid.z);
    // let i_z = floor((i / grid.y) / grid.x);
    // let i_y = floor((i - (i_z * (grid.y * grid.x))) / grid.x);

    let state = f32(cell_state[instance]);
    let pos = ((position + 2 * vec4f(i_x, i_y, -i_z, 0)) * state);
    // let pos = ((position + 2 * vec4f(i_x, i_y, -i_z, 0)));
    // let pos = position;


    var output: VertexOutput;
    output.Position = uniforms.modelViewProjectionMatrix * pos;

    // output.Position = vec4f(grid_pos, 1);
    // output.Position = output.Position * uniforms.modelViewProjectionMatrix;
    output.fragPosition = 0.5 * ((pos / vec4(grid, 1)) + vec4(1.0, 1.0, 1.0, 1.0));
    return output;
}

`;