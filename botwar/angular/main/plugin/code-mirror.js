"use strict";

(function () {

    angular.module('bw.main.plugin.code-mirror', [
    ])

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
    ;

})();