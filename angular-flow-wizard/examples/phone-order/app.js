"use strict";

(function () {
    /* App Module */
    angular.module("examples.phone-order.app", [
        'examples.phone-order.step1',
        'examples.phone-order.step2',
        'examples.phone-order.step3',
        'flowwizard'
    ])

        .controller("examples.phone-order.Ctrl", function($scope, Wizards) {
            $scope.order = {
                phones: []
            };

            function step(stepName) {
                return {
                    controller: "examples.phone-order." + stepName + ".Ctrl",
                    templateUrl: "examples/phone-order/" + stepName + "/" + stepName + ".html"
                };
            }

            $scope.wizard = Wizards.create($scope, [
                step("step1"),
                {
                    loop: "order.phones",
                    indexAs: "phoneIndex",
                    elementAs: "phone",
                    then: [
                        step("step2"),
                        {
                            "if": "phone.customBuild",
                            then: [
                                step("step3")
                            ]
                        }
                    ]
                }
            ]);

        })

    ;
})();
