class Triangle {
    constructor(p1, p2, p3, r, g, b, a) {
        this.type = 'triangle';
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.rgba = [r, g, b, a];
    }

    render() {
        var n = 3;

        var vertex_buffer = gl.createBuffer();
        if (!vertex_buffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...this.p1, ...this.p2, ...this.p3]), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_Position, n, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, n);
    }

    static drawTriangle3D(verticies) {
        var n = 3;

        var vertex_buffer = gl.createBuffer();
        if (!vertex_buffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_Position, n, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}