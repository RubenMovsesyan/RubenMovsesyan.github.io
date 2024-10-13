const WORKGROUP_SIZE = 4;

const comp_shader = /*wgsl*/`

@binding(1) @group(0) var<uniform> grid: vec3f;
@binding(2) @group(0) var<storage> cell_state_in: array<u32>;
@binding(3) @group(0) var<storage, read_write> cell_state_out: array<u32>;


// let i_x = i % grid.x;
// let i_y = floor(i / grid.y) % grid.y;
// let i_z = floor(i / (grid.z * grid.y));
fn cellIndex(cell: vec3u) -> u32 {
    return ((cell.y % u32(grid.y)) * u32(grid.x)) + (cell.x % u32(grid.x)) + ((cell.z % u32(grid.z)) * u32(grid.x * grid.y));
}

fn cellActive(x: u32, y: u32, z: u32) -> u32 {
    return cell_state_in[cellIndex(vec3(x, y, z))];
}

@compute @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) cell: vec3u) {
    var active_neighbors: u32 = 0;

    
    for (var a = -1; a < 2; a++) {
        for (var b = -1; b < 2; b++) {
            for (var c = -1; c < 2; c++) {
                if (a == 0 && b == 0 && c == 0) {
                    continue;
                }

                let cell_x = u32((i32(cell.x) + i32(grid.x) + a) % i32(grid.x));
                let cell_y = u32((i32(cell.y) + i32(grid.y) + b) % i32(grid.y));
                let cell_z = u32((i32(cell.z) + i32(grid.z) + c) % i32(grid.z));

                active_neighbors += cellActive(cell_x, cell_y, cell_z);
            }
        }
    }

    
    let i = cellIndex(cell.xyz);

    // if (cellActive(cell.x, cell.y, cell.z) == 1) {
    //     switch active_neighbors {
    //         case 2: {
    //             cell_state_out[i] = 0;
    //         }
    //         default: {
    //             cell_state_out[i] = 1;
    //         }
    //     }
    // } else {
    //     switch active_neighbors {
    //         case 5: {
    //             cell_state_out[i] = 1;
    //         }
    //         default: {
    //             cell_state_out[i] = 0;
    //         }
    //     }
    // }
    // if (cellActive(cell.x, cell.y, cell.z) == 1) {
    //     cell_state_out[i] = 0;
    // } else {
    //     cell_state_out[i] = 1;
    // }


    // if (cellActive(cell.x, cell.y, cell.z) == 0) {
    //     if (active_neighbors >= 14 && active_neighbors <= 19) {
    //         cell_state_out[i] = 1;
    //     } else {
    //         cell_state_out[i] = 0;
    //     }
    // } else {
    //     if (active_neighbors < 13 || active_neighbors > 19) {
    //         cell_state_out[i] = 0;
    //     } else {
    //         cell_state_out[i] = 1;
    //     }
    // }

    // Cell Alive
    // if (cellActive(cell.x, cell.y, cell.z) == 1) {
    //     switch active_neighbors {
    //         case 5: {
    //             cell_state_out[i] = cell_state_in[i];
    //         } 
    //         case 6: {
    //             cell_state_out[i] = cell_state_in[i];
    //         }
    //         default: {
    //             cell_state_out[i] = 0;
    //         }
    //     }
    // } else { // Cell Dead
    //     switch active_neighbors {
    //         case 4: {
    //             cell_state_out[i] = 1;
    //         }
    //         default: {
    //             cell_state_out[i] = cell_state_in[i];
    //         }
    //     }
    // }

    // switch active_neighbors {
    //     case 2: {
    //         cell_state_out[i] = cell_state_in[i];
    //     }
    //     case 3: {
    //         cell_state_out[i] = 1;
    //     }
    //     default: {
    //         cell_state_out[i] = 0;
    //     }
    // }

    // if (active_neighbors >= 6 && active_neighbors < 9) {
    //     cell_state_out[i] = cell_state_in[i];
    // } if (active_neighbors == 9) {
    //     cell_state_out[i] = 1;
    // } else {
    //     cell_state_out[i] = 0;
    // }

    // if (cellActive(cell.x, cell.y, cell.z) == 1) {
    //     if (active_neighbors < 6 || active_neighbors > 9) {
    //         cell_state_out[i] = 0;
    //     } else {
    //         cell_state_out[i] = cell_state_in[i];
    //     }
    // } else {
    //     if (active_neighbors == 9) {
    //         cell_state_out[i] = 1;
    //     } else {
    //         cell_state_out[i] = cell_state_in[i];
    //     }
    // }


    // https://wpmedia.wolfram.com/uploads/sites/13/2018/02/01-3-1.pdf
    // let e_l: u32 = 5;
    // let e_u: u32 = 7;
    // let f_l: u32 = 6;
    // let f_u: u32 = 6;

    let e_l: u32 = 4;
    let e_u: u32 = 5;
    let f_l: u32 = 5;
    let f_u: u32 = 5;

    if (cellActive(cell.x, cell.y, cell.z) == 1) {
        if (active_neighbors >= e_l && active_neighbors <= e_u) {
            cell_state_out[i] = 1;
        } else {
            cell_state_out[i] = 0;
        }
        // if (active_neighbors < 5 || active_neighbors > 6) {
        //     cell_state_out[i] = 0;
        // } else {
        //     cell_state_out[i] = cell_state_in[i];
        // }
    } else {
        if (active_neighbors >= f_l && active_neighbors <= f_u) {
            cell_state_out[i] = 1;
        } else {
            cell_state_out[i] = 0;
        }
        // if (active_neighbors == 5) {
        //     cell_state_out[i] = 1;
        // } else {
        //     cell_state_out[i] = cell_state_in[i];
        // }
    }
}

`;