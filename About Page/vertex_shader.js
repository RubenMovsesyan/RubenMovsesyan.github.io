const INNER_SCALE = 0.8;

const vertShader = /*wgsl*/`

struct VertexOutput {
    @builtin(position) Position: vec4f,
    @location(0) fragPosition: vec4<f32>,
}

@binding(0) @group(0) var<uniform> globalTransformationMatrix: mat3x3<f32>;
@binding(1) @group(0) var<storage> shipPosition: array<f32>;
@binding(2) @group(0) var<storage> shipDirection: array<f32>;

@vertex
fn main(
    @location(0) position: vec2f,
    @builtin(instance_index) instance: u32,
) -> VertexOutput {
    var output: VertexOutput;

    let xOffset = shipPosition[0];
    let yOffset = shipPosition[1];

    let shipDirx = shipDirection[0];
    let shipDiry = shipDirection[1];

    let theta = -atan2(shipDiry, shipDirx) + (${Math.PI} / 2);

    let sinT = sin(theta);
    let cosT = cos(theta);

    let rotateM = mat3x3f(cosT, -sinT, 0, sinT, cosT, 0, 0, 0, 1);
    let scaleM = mat3x3f(${INNER_SCALE}, 0.0, 0.0, 0.0, ${INNER_SCALE}, 0.0, 0.0, 0.0, ${INNER_SCALE});

    if (instance == 0) {
        output.Position = vec4f(globalTransformationMatrix * rotateM * vec3f(position.x, position.y, 0), 1);
        output.fragPosition = vec4f(0, 0, 0, 1);
    } else {
        output.Position = vec4f(globalTransformationMatrix * rotateM * scaleM * vec3f(position.x, position.y, 0), 1);
        output.fragPosition = vec4f(1, 1, 1, 1);
    }
    output.Position += vec4f(xOffset, yOffset, 0, 0);
    return output;
}

`;