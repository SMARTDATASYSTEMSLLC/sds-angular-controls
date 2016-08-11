(function () {
    'use strict';
    function formField ($interpolate) {
        return{
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                isRequired              : '=?',
                isReadonly              : '=?',
                field                   : '@' , //one-way binding
                label                   : '@' ,
                layout                  : '@?',
                labelCss                : '@?',
                layoutCss               : '@?',
                tel                     : '=?',
                showLabel               : '=?',
                showMyLabel             : '=?',
                showHelpText            : '=?', //boolean - optional
                showToolTip             : '=?',
                helpText                : '@?',
                errorLayoutCss          : '@?',
                hideValidationMessage   : '=?',  //default is false
                validationFieldName     : '@?',  //to override the default field   '[validationFieldName]' is required
                validationFieldLabel    : '@?'  //to override the default validation label - you can use label
            },
            templateUrl: 'sds-angular-controls/form-directives/form-field.html',
            require: '^form',
            controller: function ($scope){
                this.$scope = $scope;
            },
            link: function($scope, element, attrs, form){
                $scope.showLabel = $scope.showLabel !== false; // default to
                $scope.showMyLabel = $scope.showMyLabel === false ? false : true;
                $scope.showHelpText = $scope.showHelpText || false;
                $scope.showToolTip = $scope.showToolTip || false;
                $scope.hideValidationMessage = $scope.hideValidationMessage || false;
                $scope.layoutCss = $scope.layoutCss || "";
                $scope.errorLayoutCss = $scope.errorLayoutCss || "";

                $scope.layout = $scope.layout || "stacked";
                if($scope.layout === "horizontal"){
                    $scope.labelCss = $scope.labelCss || "col-md-4";
                }

                element.on('focus', '[name]', function (){
                    $scope.isFocused = true;
                }).on('blur', '[name]', function (){
                    $scope.isFocused = false;
                });

                //validation ie. on submit
                $scope.showError = function(){
                    var field;
                    if ($scope.field && form && form[$scope.field]){
                        field = form[$scope.field];
                        return field.$invalid && (form.$submitted || field.$dirty && !$scope.isFocused);
                    }
                    if ($scope.validationFieldName && form && form[$scope.validationFieldName]){
                        field = form[$scope.validationFieldName];
                        return field.$invalid && (form.$submitted || field.$dirty && !$scope.isFocused);
                    }
                };
                $scope.getError = function (){
                    if ($scope.field && form && form[$scope.field]) {
                        return form[$scope.field].$error;
                    }
                    if ($scope.validationFieldName && form && form[$scope.validationFieldName]){
                        return form[$scope.validationFieldName].$error;
                    }
                };
                $scope.interpolate = function (val){
                    return $interpolate(val)($scope.$parent);
                };
            }

        };
    }

    angular.module('sds-angular-controls').directive('formField', formField);
})();
