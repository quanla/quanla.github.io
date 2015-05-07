"use strict";

(function () {
    

var ObjectUtil = ObjectUtil || {};

ObjectUtil.clone = function(obj) {
    if (obj == null
        || typeof obj != "object"
    ) {
        return obj;
    } else if (obj.length == null) {
        var ret = {};
        for ( var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = ObjectUtil.clone(obj[i]);
            }
        }
        return ret;
    } else {
        var ret = [];
        for (var i = 0; i < obj.length; i++) {
            ret[i] = ObjectUtil.clone(obj[i]);
        }
        return ret;
    }
};

var Cols = Cols || {};

Cols.isEmpty = function(col) {
    return col == null || col.length == 0;
};

Cols.isNotEmpty = function(col) {
    return !Cols.isEmpty(col);
};

    

function ExecStack(sequence, evaluate) {
    this.sequence = sequence;
    this.stack = [
        {
            at: 0
        }
    ];
    this.eval = evaluate;
}
ExecStack.prototype = {
    getList: function(parent) {
        return parent ? parent.then : this.sequence;
    },
    getCurrentStep: function() {
        return this.getStep(this.stack);
    },
    getStep: function(stack, mod) {
        var lookingAt;
        for (var i = 0; i < (mod == null ? stack.length : mod < 0 ? stack.length + mod : mod); i++) {
            var s = stack[i];
            lookingAt = this.getList(lookingAt)[s.at];
        }
        return lookingAt;
    },
    peekNextStep: function() {
        return this.tryChangeStep(true);
    },
    peekPrevStep: function() {
        return this.tryChangeStep(false);
    },
    setVariables: function(setter) {
        for (var i = 0; i < this.stack.length; i++) {
            var s = this.stack[i];

            if (s.loopIndex != null) {
                var step = this.getStep(this.stack, i);
                setter(step.elementAs, this.eval(step.loop)[s.loopIndex]);
                setter(step.indexAs, s.loopIndex);
            }
        }
    },
    tryChangeStep: function(advancing) {
        var me = this;

        function changeStep(mod) {
            var ret = ObjectUtil.clone(me.stack);
            ret[ret.length - 1].at += mod ;
            return ret;
        }

        var assume = changeStep(advancing ? +1 : -1);

        function isExceedEndSequence() {
            return assume[assume.length - 1].at > me.getList(me.getStep(assume, -1)).length - 1;
        }
        function isBeforeStartSequence() {
            return assume[assume.length - 1].at < 0;
        }

        function isInLoop() {
            return isLoop(me.getStep(assume, -1));
        }
        function checkAdvancingParentLoopCond() {
            var loopStep = me.getStep(assume, -1);

            var col = me.eval(loopStep.loop);

            var s = assume[assume.length - 1];

            return s.loopIndex + 1 <= col.length - 1;
        }
        function checkBackingParentLoopCond() {
            var s = assume[assume.length - 1];

            return s.loopIndex > 0;
        }
        function isLoop(step) {
            return step.loop != null;
        }

        function checkLoopCond(step) {
            var col = me.eval(step.loop);
            return Cols.isNotEmpty(col);
        }
        function checkIfCond(step) {
            return me.eval(step.if);
        }

        function isIf(step) {
            return step.if != null;
        }

        for (;;) {
            if (isBeforeStartSequence()) {
                if (assume.length == 1) {
                    // in nothing, end!
                    return null;
                } else if (isInLoop()) {
                    if (checkBackingParentLoopCond()) {
                        // Looping
                        assume[assume.length - 1].loopIndex--;
                        var parentStep = me.getStep(assume, -1);
                        assume[assume.length - 1].at = me.eval(parentStep.loop).length - 1;

                    } else {
                        // Out of loop
                        assume.splice(assume.length - 1, 1);
                        assume[assume.length - 1].at--;
                    }
                } else {
                    // Is in if block
                    assume.splice(assume.length - 1, 1);
                    assume[assume.length - 1].at--;
                }
            } else if (isExceedEndSequence()) {
                if (assume.length == 1) {
                    // in nothing, end!
                    return null;
                } else if (isInLoop()) {
                    if (checkAdvancingParentLoopCond()) {
                        // Looping
                        assume[assume.length - 1].loopIndex++;
                        assume[assume.length - 1].at = 0;
                    } else {
                        // Out of loop
                        assume.splice(assume.length - 1, 1);
                        assume[assume.length - 1].at++;
                    }
                } else {
                    // Is in if block
                    assume.splice(assume.length - 1, 1);
                    assume[assume.length - 1].at++;
                }

            } else {
                var step = me.getStep(assume);
                if (isIf(step)) {
                    if (checkIfCond(step)) {
                        assume.push({
                            at: (advancing ? 0 : step.then.length - 1)
                        });
                    } else {
                        // Go on, skip if
                        assume[assume.length - 1].at += advancing ? 1 : -1;
                    }
                } else if (isLoop(step)) {
                    if (checkLoopCond(step)) {
                        assume.push({
                            at: (advancing ? 0 : step.then.length - 1),
                            loopIndex: (advancing ? 0 : me.eval(step.loop).length - 1)
                        });
                    } else {
                        // Go on, skip loop
                        assume[assume.length - 1].at += advancing ? 1 : -1;
                    }
                } else {
                    // Normal step
                    return assume;
                }
            }
        }
    }
};

    angular.module('flowwizard', [
    ])
        .factory("Wizards", ["$compile", "$templateCache", "$http", "$controller", function($compile, $templateCache, $http, $controller) {
            function noAnimation() {
                return {
                    start: function(cleanup) {
                        cleanup();
                        return null;
                    }
                };
            }

            return {
                create: function($scope, sequence) {
                    var animationProvider = noAnimation();

                    var wizardStack = new ExecStack(sequence, function(str) { return $scope.$eval(str); });
                    var finished = false;
                    var valid = true;

                    var currentStep = null;

                    var removeCurrentStep;

                    function loadTemplate(step, wizardScope, done) {

                        var templatePromise = $http.get(step.templateUrl, {cache: $templateCache}).then(function (result) {return result.data;});

                        templatePromise.then(function(content) {

                            var stepScope = wizardScope.$new();
                            var stepConfig = null;
                            $controller(step.controller, {
                                $scope: stepScope,
                                $wizardStepSetup: function(stepConfig1) {
                                    stepConfig = Object.create(step);
                                    ObjectUtil.copy(stepConfig1, stepConfig);
                                }
                            });
                            if (stepConfig == null) {
                                stepConfig = Object.create(step);
                            }

                            var el = $compile(angular.element(content))(stepScope);

                            if (done) done(stepScope, el, stepConfig);
                        });

                    }

                    var animation;
                    function reload(stack) {

                        if (removeCurrentStep) {
                            var removing = removeCurrentStep;
                            removeCurrentStep = null;
                            animation = animationProvider.start(removing, function() {
                                animation = null;
                            });
                        }

                        if (stack != null) {
                            loadTemplate(wizardStack.getStep(stack), $scope, function(stepScope, el, stepConfig) {
                                var toLoadTemplate = function() {
                                    currentStep = stepConfig;
                                    currentStep.contentEl = el;
                                    wizardStack.stack = stack;

                                    wizardStack.setVariables(function(name, value) {
                                        $scope[name] = value;
                                    });

                                    if (currentStep.valid) {
                                        stepScope.$watch(currentStep.valid, function(valid1) {
                                            valid = valid1;
                                        });
                                    }

                                    removeCurrentStep = function() {
                                        currentStep = null;
                                        stepScope.$destroy();
                                    };
                                };
                                if (animation != null) {
                                    animation.mainExec(toLoadTemplate);
                                } else {
                                    toLoadTemplate();
                                }
                            });
                        }
                    }

                    reload(wizardStack.stack);

                    return {
                        get finished() {
                            return finished;
                        },
                        get valid() {
                            return valid;
                        },
                        get currentStep() {
                            return currentStep;
                        },
                        set animationProvider(ap) {
                            animationProvider = ap;
                        },
                        nextStep: function() {
                            if (currentStep.save) {
                                currentStep.save();
                            }

                            var peekNextStep = wizardStack.peekNextStep();
                            if (peekNextStep == null) {
                                finished = true;
                                reload(null);
                            } else {
                                reload(peekNextStep);
                            }

                        },
                        prevStep: function() {
                            reload(wizardStack.peekPrevStep());
                        },
                        hasPrevStep: function() {
                            return wizardStack.peekPrevStep() != null;
                        },
                        hasNextStep: function() {
                            return wizardStack.peekNextStep() != null;
                        },
                        toStep: reload
                    };
                }
            };
        }])

        .directive("wzFade", function() {

            function fadeAnimation(fade, apply) {
                return {
                    start: function(cleanup, done) {
                        var main;
                        var ready = false;

                        fade.fadeOut(200, function() {
                            cleanup();

                            if (main != null) {
                                apply(main);
                                fade.fadeIn(200);
                                done();
                            } else {
                                ready = true;
                            }
                        });

                        return {
                            mainExec: function(main1) {
                                if (ready) {
                                    apply(main1);
                                    fade.fadeIn(200);
                                    done();
                                } else {
                                    main = main1;
                                }
                            }
                        };
                    }
                };
            }

            return {
                restrict: "A",
                link: function($scope, elem, attrs) {
                    var wizard = $scope.$eval(attrs.wzFade);

                    wizard.animationProvider = fadeAnimation(elem, function(a) {$scope.$applyAsync(a);});
                }
            };
        })

        .directive("flowWizard", function() {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {
                    var removePreviousContent;

                    $scope.$watch(attrs.flowWizard + ".currentStep.contentEl", function(contentEl) {
                        if (removePreviousContent) {
                            removePreviousContent();
                            removePreviousContent = null;
                        }

                        if (contentEl) {
                            elem.append(contentEl);

                            removePreviousContent = function () {
                                contentEl.remove();
                                elem.html("");
                            };
                        }
                    });
                }
            };
        })
    ;

})();