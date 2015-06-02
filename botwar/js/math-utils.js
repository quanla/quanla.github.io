var Distance = {};
Distance.between = function(p1, p2) {
    return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
};

var Cols = Cols || {};

Cols.findMin = function(col, func) {
    var minE;
    var minV;

    col.forEach(function(e) {
        var v = func(e);
        if (minV == null || minV > v) {
            minE = e;
            minV = v;
        }
    });
    return minE;
};

var Vectors = {};
Vectors.vectorPos = function(v) {
    var calAngle = (Math.PI / 2) - v.direction;
    var x1 = Math.cos(calAngle) * v.value;
    var y1 = Math.sin(calAngle) * v.value;
    return {x: x1, y: -y1};
};

Vectors.toVector = function(vectorPos) {
    var value = Math.sqrt(vectorPos.x * vectorPos.x + vectorPos.y * vectorPos.y);
    var direction = -Math.asin(vectorPos.y / value);
    if (vectorPos.x < 0) {
        direction = Math.PI - direction;
    }
    return {
        value: value,
        direction: (Math.PI / 2) - direction
    }
};
Vectors.add = function(v1, v2) {
    var p1 = Vectors.vectorPos(v1);
    var p2 = Vectors.vectorPos(v2);
    var toVector = Vectors.toVector(Vectors.addPos(p1, p2));

    return toVector;
};
Vectors.addPos = function(p1, p2) {
    return {x: p1.x + p2.x, y: p1.y + p2.y};
};

Vectors.subtractPos = function(p, by) {
    return {x: p.x - by.x, y: p.y - by.y};
};
