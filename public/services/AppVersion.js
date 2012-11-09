define(["require", "exports", "../app"], function(require, exports, __app__) {
    var app = __app__;

    app.main.factory('AppVersion', function ($rootScope) {
        return {
            num: "1.1"
        };
    });
})

