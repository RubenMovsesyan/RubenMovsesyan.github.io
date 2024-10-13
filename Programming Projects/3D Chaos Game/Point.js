class Point {
    constructor(x, y, z, size, color) {
        this.type = 'point';
        this.position = [x, y, z];
        this.color = color;
        this.size = size;
        this.matrix = new Matrix4();
    }

    render() {
        var xyz = this.position;
        var rgba = this.color;
        var size = this.size;

        // Quit using the buffer to send the attribute
        gl.disableVertexAttribArray(a_Position);

        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xyz[0], xyz[1], xyz[2]);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // Pass the size of a point to a_size variable
        gl.uniform1f(a_size, size);

        // Draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}