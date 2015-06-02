"use strict";

(function () {
    // # include "common-utils.js"

    angular.module('angular-bit', [
    ])
        .directive("bitMask", function() {
            return {
                restrict: "A",
                require: "ngModel",
                link: function($scope, elem, attrs, ngModelCtrl) {
                    var bitMask = parseInt($scope.$eval(attrs.bitMask));

                    ngModelCtrl.$formatters.push(function(mVal) {
                        return (mVal & bitMask) > 0;
                    });
                    ngModelCtrl.$parsers.push(function(vVal) {
                        var oldValue = ngModelCtrl.$modelValue;
                        return vVal ? oldValue | bitMask : oldValue & ~bitMask;
                    });
                }
            };
        })
    ;

})();