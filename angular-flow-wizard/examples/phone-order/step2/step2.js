"use strict";

(function () {

    angular.module('examples.phone-order.step2', [
    ])
        .controller("examples.phone-order.step2.Ctrl", function($scope, $wizardStepSetup) {
            $wizardStepSetup({
                valid: "phone.type"
            });
        })
    ;

})();