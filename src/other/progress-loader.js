/**
 * Created by stevegentile on 9/1/15.
 */
(function (){
    'use strict';

    function progressLoader($timeout, $window, $q, $rootScope, $location) {
        var active = 0;
        var notice = null;

        return {
            wait: function (promise, isBlocking){
                if (isBlocking){
                    this.start();
                }

                return promise.then(this.end, function (arg){
                    return $q.reject(this.end(arg));
                });
            },
            start: function (arg) {
                if ( ++active < 2) {
                    var settings = {
                        message: '<i class="fa fa-spinner fa-spin"></i>',
                        //baseZ:1500,
                        baseZ: 9999,
                        ignoreIfBlocked: true,
                        css: {
                            border: 'none',
                            padding: '15px',
                            backgroundColor: '#000',
                            '-webkit-border-radius': '10px',
                            '-moz-border-radius': '10px',
                            opacity: 0.5,
                            color: '#fff',
                            width: '144px',
                            'font-size': '72px',
                            left:'50%',
                            'margin-left': '-50px'
                        }
                    };
                    angular.extend(settings, arg);
                    $.blockUI(settings);
                }
                return arg;
            },
            end: function (arg) {
                if (--active < 1) {
                    if (notice){
                        notice.update({
                            delay: 0,
                            hide: true
                        });
                    }
                    $.unblockUI();
                    active = 0;
                }
                return arg;
            },
            endAll: function(arg){
                if (notice){
                    notice.update({
                        delay: 0,
                        hide: true
                    });
                }
                $.unblockUI();
                active = 0;
                return arg;
            },
            attachToRoute: function(title) {
                var self = this;
                self.lastUrl = $location.path();

                $rootScope.$on('$routeChangeStart', function (event, current) {
                    //this is needed because
                    //1. on $route.reload no 'success' is fired and the spinner never stops
                    //2. clicking, ie. a node menu again, behaves the same as a route reload
                    if (self.lastUrl !== $location.path()) {
                        self.start();
                    }

                    self.lastUrl = $location.path();
                });

                $rootScope.$on('$routeChangeSuccess', function (event, current) {
                    if (current && current.title) {
                        $rootScope.title = current.title;
                    }else{
                        $rootScope.title = title;
                    }
                    self.endAll();
                });

                $rootScope.$on('$routeChangeError', function(){
                    self.endAll();
                });

                $rootScope.$on('cancelProgressLoader', function() {
                    self.endAll();
                });
            }
        };
    }

    angular.module('sds-angular-controls').factory('progressLoader',progressLoader);

})();
