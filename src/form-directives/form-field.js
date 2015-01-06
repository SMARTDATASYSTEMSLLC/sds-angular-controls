/**
 * Created by stevegentile on 12/19/14.
 */
/**
 * Created by stevegentile on 12/19/14.
 */
(function () {
    'use strict';
    function formField ($filter, $timeout) {
        return{
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                record                  : '=' , //two-way binding
                isRequired              : '=?',
                isReadonly              : '=?',
                field                   : '@' , //one-way binding
                label                   : '@' ,
                rowClass                : '@?',
                layout                  : '@?',
                labelCss                : '@?',
                layoutCss               : '@?',
                errorLayoutCss          : '@?',
                hideValidationMessage   : '=?',  //default is false
                validationFieldName       : '@?'  //to override the default label   '[validationFieldName]' is required
            },
            templateUrl: 'sds-angular-controls/form-directives/form-field.html',
            require: '^form',
            controller: function($scope, $element){
                $scope.layout = $scope.layout || "stacked";

                if(!$scope.label){
                    $scope.label = $filter("labelCase")($scope.field);
                }

                $scope.validationFieldName = $scope.validationFieldName || $filter("labelCase")($scope.label);

                $scope.$watch("record", function(newVal, oldVal){
                    if(newVal) {
                        $scope.record = newVal;
                    }
                });

                $scope.showLabel = $scope.showLabel !== false; // default to true
                $scope.hideValidationMessage = $scope.hideValidationMessage || false;
                $scope.isRequired = $scope.isRequired || false;
                $scope.isReadonly = $scope.isReadonly || false;
                $scope.layoutCss = $scope.layoutCss || "col-md-12";
                $scope.errorLayoutCss = $scope.errorLayoutCss || "col-md-12";

                if($scope.layout === "horizontal"){
                    $scope.labelCss = $scope.labelCss || "col-md-2";
                }

                this.setValue = function(val){
                    $scope.record[$scope.field] = val;
                };


                this.setMin = function (min){
                    $scope.min = min;
                };

                this.setMax = function (max){
                    $scope.max = max;
                };

            },
            link: function($scope, element, attrs, form){
                $scope.showDefault = false;
                $timeout(function(){
                    if($(element).find('ng-transclude *').length === 0){
                        $scope.showDefault = true;
                    }
                }, 0);

                $scope.showError = function(field){
                    try{
                        if(form.$submitted){
                            return field.$invalid;
                        }else {
                            return field.$dirty && field.$invalid;
                        }
                    }
                    catch(err){
                        return false;
                    }
                }
            }

        }
    }

    angular.module('sds-angular-controls').directive('formField', formField);
})();
