THREE.Object3D.prototype.findByName = function(name) {
    var res;
    this.traverse((obj) => {
        if (!res && obj.name === name) res = obj;
    });
    return res;
}

THREE.Object3D.prototype.findAllByName = function(name) {
    var res = [];
    this.traverse((obj) => {
        if (obj.name === name) res.push(obj);
    });
    return res;
}
