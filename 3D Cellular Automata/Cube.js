class Cube {
    constructor(edge_size) {
        this.edge_size = edge_size;
        this.cube_vertex_size = 12;
        this.cube_vertex_count = 3 * 12;
        this.cube_vertex_array = new Float32Array([


            // Front
            -edge_size, -edge_size, -edge_size,
             edge_size,  edge_size, -edge_size,
             edge_size, -edge_size, -edge_size,

            -edge_size, -edge_size, -edge_size,
            -edge_size,  edge_size, -edge_size,
             edge_size,  edge_size, -edge_size,


            // Back
            -edge_size, -edge_size,  edge_size,
             edge_size, -edge_size,  edge_size,
             edge_size,  edge_size,  edge_size,

            -edge_size, -edge_size,  edge_size,
             edge_size,  edge_size,  edge_size,
            -edge_size,  edge_size,  edge_size,


            // Left
            -edge_size, -edge_size, -edge_size,
            -edge_size, -edge_size,  edge_size,
            -edge_size,  edge_size,  edge_size,

            -edge_size, -edge_size, -edge_size,
            -edge_size,  edge_size,  edge_size,
            -edge_size,  edge_size, -edge_size,


            // Right
             edge_size, -edge_size, -edge_size,
             edge_size,  edge_size,  edge_size,
             edge_size, -edge_size,  edge_size,

             edge_size, -edge_size, -edge_size,
             edge_size,  edge_size, -edge_size,
             edge_size,  edge_size,  edge_size,

            
            // Top
            -edge_size,  edge_size, -edge_size,
             edge_size,  edge_size,  edge_size,
             edge_size,  edge_size, -edge_size,

            -edge_size,  edge_size, -edge_size,
            -edge_size,  edge_size,  edge_size,
             edge_size,  edge_size,  edge_size,
            
            
            // Bottom
            -edge_size, -edge_size, -edge_size,
             edge_size, -edge_size, -edge_size,
             edge_size, -edge_size,  edge_size,

            -edge_size, -edge_size, -edge_size,
             edge_size, -edge_size,  edge_size,
            -edge_size, -edge_size,  edge_size,
        ]);
    }

    
}

// export default Cube;