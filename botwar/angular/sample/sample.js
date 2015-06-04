"use strict";

(function () {

    angular.module('bw.sample', [
    ])
        .factory("SampleBot", function() {
            return {

            };
        })

        .factory("BotSource", function() {
            return {
                createBot: function(source) {
                    var allowLogging = true;
                    var botFunc = eval("(function() {" + (allowLogging ? "" : "var console=null;") + source + "\nreturn Bot;})()");

                    var bot = new botFunc();

                    return bot;
                }
            };
        })

        .factory("SampleFightBot", function(BotSource, $http) {
            return {
                createSampleBot: function(onDone) {
                    $http.get("sample-bots/fight-bot.js").success(function(source) {
                        onDone(BotSource.createBot(source));
                    });
                }
            };
        })
        .factory("SampleRunBot", function(BotSource, $http) {
            return {
                createSampleBot: function(onDone) {
                    $http.get("sample-bots/run-bot.js").success(function(source) {
                        onDone(BotSource.createBot(source));
                    });
                }
            };
        })
        .factory("SamplePreemptBot", function(BotSource, $http) {
            return {
                createSampleBot: function(onDone) {
                    $http.get("sample-bots/preempt-bot.js").success(function(source) {
                        onDone(BotSource.createBot(source));
                    });
                }
            };
        })
    ;

})();