
(function () {
    'use strict';
    function formControl ($injector, $compile, formControlFormatters, _) {
        return{
            restrict: 'A',
            terminal: true,
            priority: 1000,
            require: ['^formField'],
            link:  function ($scope, $element, $attrs, containers) {
                var formField = containers[0], name;

                if(!$element.attr('maxLength')) {
                    if ($element.is("input")) {
                        $element.attr('maxLength', 255);
                    }

                    if ($element.is("textarea")) {
                        $element.attr('maxLength', 5000);
                    }
                }

                if (formField.$scope.validationFieldName){
                    name = formField.$scope.validationFieldName;
                } else {
                    name = $attrs.name || ($attrs.ngModel && $attrs.ngModel.substr($attrs.ngModel.lastIndexOf('.')+1)) || ($attrs.sdsModel && $attrs.sdsModel.substr($attrs.sdsModel.lastIndexOf('.')+1));
                }

                if(!name){
                    alert('control must have a name via validationFieldName or model(ng/sds)');
                }

                $element.attr('name', name);
                $element.attr('ng-required', $attrs.ngRequired || '{{container.isRequired}}');
                $element.removeAttr('form-control');
                $element.removeAttr('data-form-control');

                if ($element.is('input, select, textarea')){
                    $element.addClass('form-control');
                }

                $scope.container = formField.$scope;

                formField.$scope.tel = false;

                if($element.attr('type') === 'tel'){
                    formField.$scope.tel = true;
                    $element.attr('ng-pattern', /^\(?[0-9]{3}(\-|\)) ?[0-9]{3}-[0-9]{4}$/);
                }

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
                    formatter = /*@ngInject*/function (ngModel){ return function (){ return ngModel(); }};
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
        'select[ng-options]': /*@ngInject*/function (ngModel, $attrs, $parse, $scope){
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
        'select[selectize]': /*@ngInject*/function (ngModel, $attrs, $parse, $scope){
            return function (){ //TODO: correct this
                return ngModel();
            };
        },
        'toggle-switch': /*@ngInject*/function (ngModel, $attrs){
            return function (){
                return ngModel() ? $attrs.onLabel : $attrs.offLabel;
            };
        },
        'timepicker': /*@ngInject*/function (ngModel, $attrs){
            return function (){
                return moment(ngModel()).format('h:mm a');
            };
        },
        'input[datepicker-popup]': /*@ngInject*/function (ngModel, $attrs, $scope, $interpolate){
            return function (){
                return moment(ngModel()).format($interpolate($attrs.datepickerPopup)($scope).replace(/d/g, 'D').replace(/E/g, 'd').replace(/y/g, 'Y'));
            };
        }
    };

    angular.module('sds-angular-controls')
        .directive('formControl', formControl)
        .constant('formControlFormatters', formControlFormatters)

})();
