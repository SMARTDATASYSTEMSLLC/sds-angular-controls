/**
 * Created by stevegentile on 12/19/14.
 */
(function () {
    'use strict';
    function formDatePicker () {
        return{
            restrict: 'EA',
            require: '^form-field',
            replace: true,
            scope: {
                sdsModel         : '=',
                dateFormat       : '@',
                max              : '=?',
                min              : '=?',
                placeholder      : '@?'
            },
            templateUrl: 'sds-angular-controls/form-directives/form-date-picker.html',

            link: function ($scope, $element, $attrs, formField) {
                var input = $element.find('input');
                $scope.container = formField.$scope;
                $scope.dateFormat = $scope.dateFormat || "MM-dd-yyyy";

                $scope.calendar = {opened: false};
                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.isOpened = true;
                };

                $scope.$watch('sdsModel', function (val){
                    if (typeof val === 'string'){
                        $scope.sdsModel = moment.utc(val).toDate();
                    }
                });

                formField.$scope.field = $attrs.name || $attrs.sdsModel.substr($attrs.sdsModel.lastIndexOf('.')+1);
                if ($scope.max) {
                    formField.$scope.max = moment.utc($scope.max).format($scope.dateFormat.toUpperCase());
                }
                if ($scope.min) {
                    formField.$scope.min = moment.utc($scope.min).format($scope.dateFormat.toUpperCase());
                }
            }
        }
    }

    // function uibDatepickerPopup (){
    //     return {
    //         restrict: 'EAC',
    //         require: 'ngModel',
    //         link: function($scope, $element, $attrs, controller) {
    //             //remove the default formatter from the input directive to prevent conflict
    //             controller.$formatters.shift();
    //         }
    //     }
    // }

    angular.module('sds-angular-controls').directive('formDatePicker', formDatePicker);
})();
