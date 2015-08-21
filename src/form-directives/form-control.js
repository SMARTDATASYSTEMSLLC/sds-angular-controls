
(function () {
    'use strict';
    function formControl ($injector, $compile, formControlFormatters) {
        return{
            restrict: 'A',
            terminal: true,
            priority: 1000,
            require: ['^formField'],
            link:  function ($scope, $element, $attrs, containers) {
                var formField = containers[0];
                var name = $attrs.name || $attrs.ngModel.substr($attrs.ngModel.lastIndexOf('.')+1);
                if(formField.$scope.validationFieldName){
                    name = formField.$scope.validationFieldName;
                }
                $element.attr('name', name);
                $element.attr('ng-required', $attrs.ngRequired || '{{container.isRequired}}');
                $element.removeAttr('form-control');
                $element.removeAttr('data-form-control');

                if ($element.is('input, select, textarea')){
                    $element.addClass('form-control');
                }

                $scope.container = formField.$scope;

                formField.$scope.field = name;
                if ($attrs.min){
                    formField.$scope.min = $attrs.min;
                }
                if ($attrs.max){
                    formField.$scope.max = $attrs.max;
                }
                if ($attrs.layoutCss && formField.$scope.layout === 'horizontal'){
                     formField.$scope.childLayoutCss = $attrs.layoutCss;
                }


                // handle custom formatters for disabled controls
                var formatter = _.find(formControlFormatters, function (v, k){ return $element.is(k); });
                if (!formatter) {
                    formatter = function (ngModel){ return function (){ return ngModel(); }};
                }
                var getModel = function (obj, key){
                    var arr = key.split(".");
                    while(arr.length && (obj = obj[arr.shift()])); // jshint ignore:line
                    return obj;
                };

                formField.$scope.valueFormatter = $injector.invoke(formatter, this, {ngModel: getModel.bind(this, $scope, $attrs.ngModel), $attrs: $attrs, $scope: $scope});

                $compile($element)($scope);
            }
        }
    }

    var formControlFormatters = {
        'select[ng-options]': function (ngModel, $attrs, $parse, $scope){
            var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;
            var match = $attrs.ngOptions.match(NG_OPTIONS_REGEXP);
            var prop = match[5] || match[7];
            var valuesFn = $parse(match[8]);
            var result = $parse(/ as /.test(match[0]) || match[2] ? match[1] : prop);
            var label = $parse(match[2] || match[1]);

            return function (){
                var model = ngModel();

                var rec = {};
                rec[prop] = _.find(valuesFn($scope), function (v){
                    var option = {};
                    option[prop] = v;
                    return result($scope, option) === model;
                });
                return label($scope, rec);
            };
        },
        'select[selectize]': function (ngModel, $attrs, $parse, $scope){
            return function (){ //TODO: correct this
                return ngModel();
            };
        },
        'toggle-switch': function (ngModel, $attrs){
            return function (){
                return ngModel() ? $attrs.onLabel : $attrs.offLabel;
            };
        },
        'timepicker': function (ngModel, $attrs){
            return function (){
                return moment(ngModel()).format('h:mm a');
            };
        },
        'input[datepicker-popup]': function (ngModel, $attrs, $scope, $interpolate){
            return function (){
                return moment(ngModel()).format($interpolate($attrs.datepickerPopup)($scope).replace(/d/g, 'D').replace(/E/g, 'd').replace(/y/g, 'Y'));
            };
        }
    };

    angular.module('sds-angular-controls')
        .directive('formControl', formControl)
        .constant('formControlFormatters', formControlFormatters)

})();
