class Cube {
    constructor(origin, size, color) {
        this.type = 'cube';
        this.color = color;
        this.origin = origin;
        this.size = size;
        this.matrix = new Matrix4();
    }

    render() {
        var [x, y, z] = this.origin;
        var [width, height, length] = this.size;

        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front
        Triangle.drawTriangle3D([x, y, z,                   x + width, y, z,                    x, y + height, z]);
        Triangle.drawTriangle3D([x + width, y, z,           x + width, y + height, z,           x, y + height, z]);

        gl.uniform4f(u_FragColor, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3]);

        // Right
        Triangle.drawTriangle3D([x + width, y, z,           x + width, y, z + length,           x + width, y + height, z]);
        Triangle.drawTriangle3D([x + width, y, z + length,  x + width, y + height, z + length,  x + width, y + height, z]);



        // Left
        Triangle.drawTriangle3D([x, y, z,                   x, y, z + length,                   x, y + height, z + length]);
        Triangle.drawTriangle3D([x, y, z,                   x, y + height, z,                   x, y + height, z + length]);

        gl.uniform4f(u_FragColor, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3]);

        // Back
        Triangle.drawTriangle3D([x, y, z + length,          x + width, y, z + length,           x + width, y + height, z + length]);
        Triangle.drawTriangle3D([x, y, z + length,          x, y + height, z + length,          x + width, y + height, z + length]);

        gl.uniform4f(u_FragColor, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3]);

        // Top
        Triangle.drawTriangle3D([x, y + height, z,          x + width, y + height, z,           x + width, y + height, z + length]);
        Triangle.drawTriangle3D([x, y + height, z,          x, y + height, z + length,          x + width, y + height, z + length]);

        // Bottom
        Triangle.drawTriangle3D([x, y, z,                   x + width, y, z,                    x + width, y, z + length]);
        Triangle.drawTriangle3D([x, y, z,                   x, y, z + length,                   x + width, y, z + length]);
    }
}