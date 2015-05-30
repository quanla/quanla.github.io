"use strict";

(function () {

    angular.module('rc.battlefield', [
    ])

        .directive("battlefield", function() {
            return {
                restrict: "A",
                scope: {
                    game: "=battlefield"
                },
                link: function($scope, elem, attrs) {
                    var canvas = elem[0];

                    var btc = BattlefieldCanvas(canvas);

                    btc.load(function() {
                        $scope.apply(function() {

                        });
                    });



                    //ctx.fillStyle = "rgb(200,0,0)";
                    //ctx.fillRect (10, 10, 55, 50);
                    //
                    //ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
                    //ctx.fillRect (30, 30, 55, 50);
                }
            };
        })
    ;

    function BattlefieldCanvas(canvasElem) {

        var ctx = canvasElem.getContext('2d');

        return {
            load: function(onDone) {
                var images = [
                    'img/robo/body.png',
                    'img/robo/radar.png',
                    'img/robo/turret.png'
                ];

                var runAfterCount = Async.runAfterCount(images.length, function () {
                    onDone();
                });
                for (var i = 0; i < images.length; i++) {
                    var src = images[i];
                    var image = new Image();
                    image.addEventListener("load", function() {
                        runAfterCount();
                    }, false);
                    image.src = src; // Set source path
                }
            }
        };
    }
})();