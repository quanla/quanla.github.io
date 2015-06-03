"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit', [
        'bw.battlefield.renderer.unit.footman'
    ])

        .factory("ColorMatrixCombi", function() {
            return {
                createColorMatrixCombi: function() {

                    var filter = new PIXI.filters.ColorMatrixFilter();

                    var normal = [
                        1,   0,   0,   0, 0,
                        0,   1,   0,   0, 0,
                        0,   0,   1,   0, 0,
                        0,   0,   0,   1, 0
                    ];

                    filter.matrix = normal;

                    var matrixes = [];

                    function update() {
                        if (matrixes.length == 0) {
                            filter.matrix = normal;
                        } else {
                            var ret = ObjectUtil.clone(matrixes[0]);
                            for (var i = 1; i < matrixes.length; i++) {
                                var matrix = matrixes[i];

                                for (var j = 0; j < ret.length; j++) {
                                    ret[j] += matrix[j];
                                }
                            }
                            filter.matrix = ret;
                        }
                    }

                    return {
                        filter: filter,
                        matrixes: matrixes,
                        update: update,
                        addMatrix: function(matrix) {
                            matrixes.push(matrix);
                            update();
                        },
                        removeMatrix: function(matrix) {
                            Cols.remove(matrix, matrixes);
                            update();
                        }
                    }
                }
            };
        })

        .factory("HitFilter", function() {
            return {
                createHitFilter: function(colorMatrixCombi) {

                    var matrix = [
                        1,   0,   0,   0, 0,
                        0,   1,   0,   0, 0,
                        0,   0,   1,   0, 0,
                        0,   0,   0,   1, 0
                    ];

                    var visible = false;

                    return {
                        show: function(age) {
                            if (!visible) {
                                colorMatrixCombi.addMatrix(matrix);
                                visible = true;
                            }
                            var val =
                                age == 1 ? 2 :
                                age == 2 ? 1.1 :
                                    1;
                            ObjectUtil.copy([
                                val,   0,   0,   0, 0,
                                0,   val,   0,   0, 0,
                                0,   0,   val,   0, 0,
                                0,   0,   0,   1, 0
                            ], matrix);
                            colorMatrixCombi.update();
                        },
                        hide: function() {
                            if (visible) {
                                colorMatrixCombi.removeMatrix(matrix);
                                visible = false;
                            }
                        }
                    };
                }
            };
        })
    ;

})();