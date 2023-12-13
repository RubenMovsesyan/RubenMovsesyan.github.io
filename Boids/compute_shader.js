const WORKGROUP_SIZE = 64;
const NUM_BOIDS = 4000;

const MAX_SPEED = 0.005;
const MIN_SPEED = 0.002;

const AVOID_FACTOR = 0.006;
const VISIBLE_RANGE = 0.05;
const PROTECTED_RANGE = 0.0175;
const MATCHING_FACTOR = 0.0025;
const CENTERING_FACTOR = 0.0008;
const TURN_FACTOR = 0.000015;

const LEFT_MARGIN = -0.65;
const RIGHT_MARGIN = 0.65;
const BOTTOM_MARGIN = 0.65;
const TOP_MARGIN = -0.65;

const compShader = /*wgsl*/`

@binding(1) @group(0) var<storage> boidPositionsIn: array<f32>;
@binding(2) @group(0) var<storage, read_write> boidPositionsOut: array<f32>;

@binding(3) @group(0) var<storage> boidDirectionsIn: array<f32>;
@binding(4) @group(0) var<storage, read_write> boidDirectionsOut: array<f32>;

@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) boid: vec3u) {
    var boidPos = vec2f(boidPositionsIn[2 * boid.x], boidPositionsIn[(2 * boid.x) + 1]);
    var boidDir = vec2f(boidDirectionsIn[2 * boid.x], boidDirectionsIn[(2 * boid.x) + 1]);
    // var boidDirCart = vec2f(boidDir.x * cos(boidDir.y), boidDir.x * sin(boidDir.y));

    // Separations vars
    var closeD = vec2f(0, 0);
    
    // Alignment vars
    var velAvg = vec2f(0, 0);
    var neighboringBoids: f32 = 0;

    // Cohesion vars
    var posAvg = vec2f(0, 0);

    for (var i = 0; i < ${NUM_BOIDS}; i++) {
        let otherBoidPos = vec2f(boidPositionsIn[2 * i], boidPositionsIn[(2 * i) + 1]);
        let otherBoidDir = vec2f(boidDirectionsIn[2 * i], boidDirectionsIn[(2 * i) + 1]);
        // let otherBoidDirCart = vec2f(otherBoidDir.x * cos(otherBoidDir.y), otherBoidDir.x * sin(otherBoidDir.y));
        
        // Separation
        if (distance(boidPos, otherBoidPos) < ${PROTECTED_RANGE}) {
            closeD += boidPos - otherBoidPos;
        }

        if (distance(boidPos, otherBoidPos) < ${VISIBLE_RANGE}) {
            // Alignment
            velAvg += otherBoidDir;
            neighboringBoids += 1;

            // Cohesion
            posAvg += otherBoidPos;
        }
    }

    // Separations updates
    boidDir += closeD * ${AVOID_FACTOR};

    if (neighboringBoids > 0) {
        // Alignment updates
        velAvg /= neighboringBoids;
        boidDir += (velAvg - boidDir) * ${MATCHING_FACTOR};

        // Cohesion updates
        posAvg /= neighboringBoids;
        boidDir += (posAvg - boidPos) * ${CENTERING_FACTOR};
    }

    // // Keep the boid within the margin
    if (boidPos.x < ${LEFT_MARGIN}) {
        boidDir.x += ${TURN_FACTOR};
    }
    if (boidPos.x > ${RIGHT_MARGIN}) {
        boidDir.x -= ${TURN_FACTOR};
    }

    if (boidPos.y > ${BOTTOM_MARGIN}) {
        boidDir.y -= ${TURN_FACTOR};
    }
    if (boidPos.y < ${TOP_MARGIN}) {
        boidDir.y += ${TURN_FACTOR};
    }

    // Update the boid direction
    let speed = length(boidDir);

    if (speed > ${MAX_SPEED}) {
        boidDir = (boidDir / speed) * ${MAX_SPEED};
    } else if (speed < ${MIN_SPEED}) {
        boidDir = (boidDir / speed) * ${MIN_SPEED};
    }

    // Update the boid position
    boidPos += boidDir;

    boidPositionsOut[2 * boid.x] = boidPos.x;
    boidPositionsOut[(2 * boid.x) + 1] = boidPos.y;

    
    // boidDir = vec2f(sqrt(pow(boidDir.x, 2) + pow(boidDir.y, 2)), atan2(boidDir.y, boidDir.x));
    
    boidDirectionsOut[2 * boid.x] = boidDir.x;
    boidDirectionsOut[(2 * boid.x) + 1] = boidDir.y;
}

`;