"use strict";

(function () {

    angular.module('bt.main', [
    ])

        .controller("bt.main.Ctrl", function($scope, $http, $interval, GameService, SourceService) {

            $scope.codeDirect = SourceService.isDirect();

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

            $scope.runTest = function() {
                if ($scope.codeDirect) {
                    $scope.game = GameService.createNewGame($scope.code);
                    $scope.game.nextTurn();
                } else if ($scope.codeLocation != null) {
                    $http.get($scope.codeLocation).then(function(resp) {
                        var code = resp.data;

                        $scope.game = GameService.createNewGame(code);
                        $scope.game.nextTurn();
                    });
                }
            };
            $scope.log = function() {
                console.log($scope.game.bot);
            };

            var autoRunTask;
            $scope.autoRun = function(delay) {
                if (autoRunTask) {
                    $interval.cancel(autoRunTask);
                    autoRunTask = null;
                } else {
                    autoRunTask = $interval(function() {
                        $scope.game.nextTurn();

                        if ($scope.game.turn == 100) {
                            $interval.cancel(autoRunTask);
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