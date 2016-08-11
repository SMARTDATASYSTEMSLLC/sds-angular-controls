(function () {
    'use strict';
    function formButton ($q) {
        return{
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                buttonClass: '@?',
                action: '&'
            },
            template: '<a href="" class="btn {{buttonClass}} {{isDisabled}}" ng-click="doPromise($event)" ng-transclude></a>',
            link: function($scope, element, attrs){
                $scope.buttonClass = $scope.buttonClass || 'btn-default';
                $scope.isDisabled = '';
                $scope.doPromise = function ($event){
                    if ($scope.isDisabled){
                        return;
                    }
                    $scope.isDisabled = 'disabled';
                    $q.when($scope.action($event)).then(function (){
                        $scope.isDisabled = '';
                    }, function (){
                        $scope.isDisabled = '';
                    });
                };
            }
        };
    }

    angular.module('sds-angular-controls').directive('formButton', formButton);

})();
