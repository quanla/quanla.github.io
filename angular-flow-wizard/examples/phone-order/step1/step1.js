"use strict";

(function () {

    angular.module('examples.phone-order.step1', [
    ])
        .controller("examples.phone-order.step1.Ctrl", function($scope) {
            $scope.phoneCount = $scope.order.phones.length || 1;
            $scope.$watch("phoneCount", function(phoneCount) {
                if (phoneCount > -1) {
                    Cols.assureLength(phoneCount, $scope.order.phones, function() {return {};});
                }
            });
        })
    ;

})();