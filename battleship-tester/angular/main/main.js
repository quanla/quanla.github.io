"use strict";

(function () {

    angular.module('bt.main', [
    ])

        .controller("bt.main.Ctrl", function($scope, $http, $interval, GameService, SourceService) {

            $scope.codeDirect = SourceService.isDirect();

            $scope.gameOptions = {
                allowLogging: true
            };

            $scope.reloadCodeLocation = function() {
                $scope.codeLocation = SourceService.getRemoteLocation();
                if ($scope.codeLocation != null) {
                    $scope.runTest();
                }
            };

            $scope.$watch("codeDirect", function(codeDirect) {
                if (codeDirect) {
                    if ($scope.code == null) {
                        SourceService.getSource().then(function(code) {
                            $scope.code = code;

                            $scope.runTest();
                        });
                    }
                } else {
                    $scope.reloadCodeLocation();
                }
                SourceService.setDirect(codeDirect);
            });

            function createNewGame(code) {
                $scope.game = GameService.createNewGame(code, $scope.gameOptions);
                $scope.game.nextTurn();
            }

            $scope.runTest = function() {
                if ($scope.codeDirect) {
                    createNewGame($scope.code);
                } else if ($scope.codeLocation != null) {

                    $http.get($scope.codeLocation).then(function(resp) {
                        var code = resp.data;

                        createNewGame(code);
                    });
                }
            };
            $scope.log = function() {
                console.log($scope.game.bot);
            };

            $scope.autoRunTask;
            $scope.autoRun = function(delay) {
                if ($scope.autoRunTask) {
                    $interval.cancel($scope.autoRunTask);
                    $scope.autoRunTask = null;
                } else {
                    $scope.autoRunTask = $interval(function() {
                        $scope.game.nextTurn();

                        if ($scope.game.turn == 100 || $scope.game.isFinished()) {
                            $interval.cancel($scope.autoRunTask);
                            $scope.autoRunTask = null;
                        }
                    }, delay);
                }
            };
        })

        .directive("codeLocation", function(SourceService) {
            return {
                restrict: "E",
                scope: true,
                templateUrl: "angular/main/code-location.html",
                link: function($scope, elem, attrs) {
                    $scope.setCodeLocation = function(cl) {
                        SourceService.setRemoteLocation(cl);
                        $scope.reloadCodeLocation();
                    }
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
                templateUrl: "angular/main/game-board.html",
                link: function($scope, elem, attrs) {

                }
            };
        })
    ;

})();