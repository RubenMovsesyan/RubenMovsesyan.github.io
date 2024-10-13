class Path {
    constructor(p1, p2, weight, color) {
        this.type = 'path';
        this.p1 = p1;
        this.p2 = p2;
        this.color = color;
        this.weight = weight;

        this.matrix = new Matrix4();
    }

    render () {
        var p1 = this.p1;
        var p2 = this.p2;
        var rgba = this.color;
        var weight = this.weight;

        var n = 2;

        var vertex_buffer = gl.createBuffer();
        if (!vertex_buffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        // Write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...p1, ...p2]), gl.DYNAMIC_DRAW);

        // Assign the buffer objetc to a_Position
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // set the color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.LINE_STRIP, 0, n);
    }
}