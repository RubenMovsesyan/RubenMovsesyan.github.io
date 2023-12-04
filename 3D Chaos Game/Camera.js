class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, -2]);
        this.at = new Vector3([0, 0, 1]);
        this.up = new Vector3([0, 1, 0]);
    }

    forward() {
        var d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);
        d.normalize();
        d.mul(0.05);
        this.eye.add(d);
        this.at.add(d);
    }
}