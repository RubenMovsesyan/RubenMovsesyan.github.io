const vertShader = /*wgsl*/`

struct VertexOutput {
    @builtin(position) Position: vec4f,
    @location(0) fragPosition: vec4<f32>,
}

@binding(0) @group(0) var<uniform> globalTransformationMatrix: mat3x3<f32>;
@binding(1) @group(0) var<storage> boidPositionsIn: array<f32>;
@binding(3) @group(0) var<storage> boidDirectionsIn: array<f32>;

@vertex
fn main(
    @location(0) position: vec2f,
    @builtin(instance_index) instance: u32,
) -> VertexOutput {
    var output: VertexOutput;
    let xOffset = boidPositionsIn[2 * instance];
    let yOffset = boidPositionsIn[(2 * instance) + 1];

    let boidDirx = boidDirectionsIn[2 * instance];
    let boidDiry = boidDirectionsIn[(2 * instance) + 1];

    // Rotations are stored as angles
    let theta = -atan2(boidDiry, boidDirx) + (${Math.PI} / 2);
    // let theta = 0.0;
    let sinT = sin(theta);
    let cosT = cos(theta);

    let rotateM = mat3x3f(cosT, -sinT, 0, sinT, cosT, 0, 0, 0, 1);


    output.Position = vec4f(globalTransformationMatrix * rotateM * vec3f(position.x, position.y, 0), 1);
    output.Position += vec4f(xOffset, yOffset, 0, 0);
    output.fragPosition = vec4f(xOffset + 0.5, 1 - (xOffset + yOffset), yOffset + 0.5, 1);
    return output;
}


`;