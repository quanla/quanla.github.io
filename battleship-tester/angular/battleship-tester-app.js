"use strict";

(function () {
    /* App Module */
    angular.module("bt.app", [
        'bt.game'
    ])
        .controller("bt.Ctrl", function($scope, $http, $interval, GameService) {

            $http.get("angular/default-code.txt").success(function(code) {
                $scope.code = code;

                $scope.runTest();
            });

            $scope.runTest = function() {
                $scope.game = GameService.createNewGame($scope.code);
                $scope.game.nextTurn();
            };
            $scope.log = function() {
                console.log($scope.game.bot);
            };

            var autoRunTask;
            $scope.autoRun = function() {
                if (autoRunTask) {
                    $interval.cancel(autoRunTask);
                    autoRunTask = null;
                } else {
                    autoRunTask = $interval(function() {
                        $scope.game.nextTurn();
                    }, 200);
                }
            };
        })

        .directive("codeMirror", function($parse) {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {
                    var editor = CodeMirror(elem[0], {
                        mode:  "javascript",
                        lineNumbers: true
                    });

                    $scope.$watch(attrs.codeMirror, function(value) {
                        editor.setValue(value || "");
                    });

                    var model = $parse(attrs.codeMirror);
                    editor.on("change", function(cm, change) {
                        model.assign($scope, cm.getValue());
                    });
                }
            };
        })

        .directive("gameBoard", function() {
            return {
                restrict: "E",
                templateUrl: "angular/game-board.html",
                link: function($scope, elem, attrs) {

                }
            };
        })

    ;
})();
