var firebase;
(function (firebase) {
    var FB = (function () {
        function FB($rootScope) {
            this.$rootScope = $rootScope;
        }
        FB.prototype.game = function (gameId) {
            var ref = new Firebase("https://seanhess.firebaseio.com/uarbg2/" + gameId);
            return ref;
        };
        FB.prototype.apply = function (f) {
            var _this = this;
            return function (ref) {
                if((_this.$rootScope).$$phase) {
                    return f(ref.val());
                }
                _this.$rootScope.$apply(function () {
                    f(ref.val());
                });
            }
        };
        FB.prototype.update = function (ref, obj) {
            for(var key in obj) {
                if(obj[key] === undefined) {
                    delete obj[key];
                }
            }
            ref.set(_.omit(obj, "$$hashKey"));
        };
        return FB;
    })();
    firebase.FB = FB;    
})(firebase || (firebase = {}));

angular.module('services').factory('FB', function ($rootScope) {
    return new firebase.FB($rootScope);
});
