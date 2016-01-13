/*! 
 * sds-angular-controls
 * Angular Directives used with sds-angular generator
 * @version 1.2.6 
 * 
 * Copyright (c) 2016 Steve Gentile, David Benson 
 * @link https://github.com/SMARTDATASYSTEMSLLC/sds-angular-controls 
 * @license  MIT 
 */ 
angular.module('sds-angular-controls', ['ui.bootstrap', 'ngSanitize', 'currencyMask'])
    .constant('_', window._)
    .constant('moment', window.moment);

(function (){
  'use strict';

  function camelCase (){
    return function (input) {
      return input.toLowerCase().replace(/ (\w)/g, function (match, letter) {
        return letter.toUpperCase();
      });
    };
  }

  angular.module('sds-angular-controls').filter('camelCase', camelCase);
})();

(function (){
    'use strict';

    function keyFilter (){
        return function (obj, query) {
            var result = {};
            angular.forEach(obj, function (val, key) {
                if (key !== query) {
                    result[key] = val;
                }
            });
            return result;
        };
    }

    angular.module('sds-angular-controls').filter('keyFilter', keyFilter);
})();

(function (){
  'use strict';

  function labelCase (){
    return function (input) {

      if (input === null || input === undefined || input === ''){
          input = ' ';
      }
      input = (input + '').replace(/([A-Z])/g, ' $1');
      return input[0].toUpperCase() + input.slice(1);
    };
  }

  angular.module('sds-angular-controls').filter('labelCase', labelCase);
})();

(function (){
    'use strict';

    function ordinal (){
        var suffixes = ["th", "st", "nd", "rd"];
        return function(input) {
            var v=input%100;
            return input+(suffixes[(v-20)%10]||suffixes[v]||suffixes[0]);
        };
    }

    angular.module('sds-angular-controls').filter('ordinal', ordinal);
})();

(function (){
    'use strict';

    function unsafe ($sce) { return $sce.trustAsHtml; }
    unsafe.$inject = ["$sce"];

    angular.module('sds-angular-controls').filter('unsafe', unsafe);
})();

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
                }
            }
        }
    }
    formButton.$inject = ["$q"];

    angular.module('sds-angular-controls').directive('formButton', formButton)

})();


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
    formControl.$inject = ["$injector", "$compile", "formControlFormatters", "_"];

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

    function datepickerPopup (){
        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function($scope, $element, $attrs, controller) {
                //remove the default formatter from the input directive to prevent conflict
                controller.$formatters.shift();
            }
        }
    }

    angular.module('sds-angular-controls').directive('formDatePicker', formDatePicker).directive('datepickerPopup', datepickerPopup);
})();

/**
 * Created by stevegentile on 12/19/14.
 */
(function () {
    'use strict';
    function formField () {
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
                layout                  : '@?',
                labelCss                : '@?',
                layoutCss               : '@?',
                tel                     : '=?',
                showLabel               : '=?',
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
            controller: ["$scope", function ($scope){
                this.$scope = $scope;
            }],
            link: function($scope, element, attrs, form){
                $scope.showLabel = $scope.showLabel !== false; // default to true
                $scope.showHelpText = $scope.showHelpText || false;
                $scope.showToolTip = $scope.showToolTip || false;
                $scope.hideValidationMessage = $scope.hideValidationMessage || false;
                $scope.layoutCss = $scope.layoutCss || "col-md-12";
                $scope.errorLayoutCss = $scope.errorLayoutCss || "col-md-12";



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
                    if ($scope.field && form && form[$scope.field]){
                        var field = form[$scope.field];
                        return field.$invalid && (form.$submitted || field.$dirty && !$scope.isFocused);
                    }
                };
                $scope.getError = function (){
                    if ($scope.field && form && form[$scope.field]) {
                        return form[$scope.field].$error;
                    }
                };
            }

        }
    }

    angular.module('sds-angular-controls').directive('formField', formField);
})();

(function () {
    'use strict';

    function UnsavedConfirmationModalCtrl($scope) {

    }
    UnsavedConfirmationModalCtrl.$inject = ["$scope"];

    angular.module('sds-angular-controls').controller('UnsavedConfirmationModalCtrl',UnsavedConfirmationModalCtrl);
})();
(function(){
    'use strict';
    function formUnsaved ($rootScope, $location, $modal, progressLoader) {
        return {
            restrict: 'A',
            require: '^form',
            link: function($scope, element, attrs, form){

                //element.on("submit", function(event) {
                //    if (form && form.$valid) {
                //        progressLoader.start();
                //    }
                //});


                function routeChange(event) {
                    if(form.$dirty){
                        //var confirm = $window.confirm('You have unsaved changes');
                        //if(!confirm) {
                        progressLoader.endAll();
                        event.preventDefault();
                        //}
                        var targetPath = $location.path();

                        $modal.open({
                            templateUrl: 'sds-angular-controls/form-directives/form-unsaved-modal.html',
                            scope: $scope
                        }).result.then(function(result){
                            if(result === 'CONTINUE'){
                                form.$setPristine();
                                $location.path(targetPath);
                            }
                        });
                    }
                }

                $scope.$on('$routeChangeStart', routeChange);
            }
        }
    }
    formUnsaved.$inject = ["$rootScope", "$location", "$modal", "progressLoader"];

    angular.module('sds-angular-controls').directive('formUnsaved', formUnsaved);
})();
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
    progressLoader.$inject = ["$timeout", "$window", "$q", "$rootScope", "$location"];

    angular.module('sds-angular-controls').factory('progressLoader',progressLoader);

})();

angular.module('sds-angular-controls').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('sds-angular-controls/form-directives/form-date-picker.html',
    "<span class=\"input-group\"> <input type=\"text\" form-control class=\"datepicker\" placeholder=\"{{placeholder || container.label}}\" ng-model=\"sdsModel\" min-date=\"min\" max-date=\"max\" datepicker-popup=\"{{::dateFormat}}\" is-open=\"isOpened\"> <span class=\"input-group-btn\"> <button type=\"button\" class=\"btn btn-default\" ng-click=\"open($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button> </span> </span>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-field-validation.html',
    "<div ng-if=\"!hideValidationMessage\" class=\"has-error\" ng-show=\"showError()\" ng-messages=\"getError()\"> <span class=\"control-label\" ng-message=\"required\"> {{ validationFieldLabel || label || (field | labelCase) }} is required. </span> <span class=\"control-label\" ng-message=\"text\"> {{ validationFieldLabel || label || (field | labelCase) }} should be text. </span> <span class=\"control-label\" ng-message=\"integer\"> {{ validationFieldLabel || label || (field | labelCase) }} should be an integer. </span> <span class=\"control-label\" ng-message=\"email\"> {{ validationFieldLabel || label || (field | labelCase) }} should be an email address. </span> <span class=\"control-label\" ng-message=\"date\"> {{ validationFieldLabel || label || (field | labelCase) }} should be a date. </span> <span class=\"control-label\" ng-message=\"datetime\"> {{ validationFieldLabel || label || (field | labelCase) }} should be a datetime. </span> <span class=\"control-label\" ng-message=\"time\"> {{ validationFieldLabel || label || (field | labelCase) }} should be a time. </span> <span class=\"control-label\" ng-message=\"month\"> {{ validationFieldLabel || label || (field | labelCase) }} should be a month. </span> <span class=\"control-label\" ng-message=\"week\"> {{ validationFieldLabel || label || (field | labelCase) }} should be a week. </span> <span class=\"control-label\" ng-message=\"url\"> {{ validationFieldLabel || label || (field | labelCase) }} should be an url. </span> <span class=\"control-label\" ng-message=\"zip\"> {{ validationFieldLabel || label || (field | labelCase) }} should be a valid zipcode. </span> <span class=\"control-label\" ng-message=\"number\"> {{ validationFieldLabel || label || (field | labelCase) }} must be a number</span> <span class=\"control-label\" ng-message=\"tel\"> {{ validationFieldLabel || label || (field | labelCase) }} must be a phone number</span> <span ng-if=\"tel === true\" class=\"control-label\" ng-message=\"pattern\"> {{ validationFieldLabel || label || (field | labelCase) }} must be a phone number (xxx-xxx-xxxx or (xxx) xxx-xxxx) : {{tel}}</span> <span class=\"control-label\" ng-message=\"color\"> {{ validationFieldLabel || label || (field | labelCase) }} must be a color</span> <span class=\"control-label\" ng-message=\"min\"> {{ validationFieldLabel || label || (field | labelCase) }} must be at least {{min}}. </span> <span class=\"control-label\" ng-message=\"max\"> {{ validationFieldLabel || label || (field | labelCase) }} must not exceed {{max}} </span> <span class=\"control-label\" ng-message=\"taMaxText\"> {{ validationFieldLabel || label || (field | labelCase) }} must not exceed {{max}} </span> <span class=\"control-label\" ng-repeat=\"(k, v) in types\" ng-message=\"{{k}}\"> {{ validationFieldLabel || label || (field | labelCase) }}{{v[1]}}</span> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-field.html',
    "<div> <div ng-if=\"layout === 'stacked'\" class=\"row\"> <div class=\"form-group clearfix\" ng-class=\"{ 'has-error': showError() }\"> <div class=\"{{layoutCss}}\"> <label ng-if=\"showLabel\" class=\"control-label {{labelCss}}\"> {{ label || (field | labelCase) }} <span ng-if=\"isRequired && !isReadonly\">*</span> <span ng-if=\"showToolTip\"><a href=\"#\" uib-popover=\"{{helpText}}\" popover-trigger=\"mouseenter\"><i class=\"fa fa-question-circle\"></i></a></span> <!--<span ng-if=\"showToolTip\" uib-popover=\"{{helpText}}\" popover-trigger=\"mouseenter\"><i class=\"fa fa-question-circle\"></i></span>--> </label> <div ng-if=\"!valueFormatter || !isReadonly\"><ng-transclude></ng-transclude></div> <input ng-if=\"valueFormatter && isReadonly\" class=\"form-control\" type=\"text\" ng-value=\"valueFormatter()\" name=\"{{field}}\" readonly> <!-- validation --> <div class=\"pull-left\" ng-include=\"'sds-angular-controls/form-directives/form-field-validation.html'\"></div> <div ng-if=\"showHelpText && !showToolTip\" class=\"help-text\"> <i>{{helpText}}</i> </div> </div> </div> </div> <div ng-if=\"layout === 'horizontal'\" class=\"row inline-control\"> <div class=\"form-group clearfix\" ng-class=\"{ 'has-error': showError() }\"> <label ng-if=\"showLabel\" class=\"control-label {{labelCss}}\"> {{ label || (field | labelCase) }} <span ng-if=\"isRequired && !isReadonly\">*</span></label> <div class=\"{{childLayoutCss || 'col-md-6'}}\"> <span ng-if=\"!valueFormatter || !isReadonly\"><ng-transclude></ng-transclude></span> <input ng-if=\"valueFormatter && isReadonly\" class=\"form-control\" type=\"text\" ng-value=\"valueFormatter()\" name=\"{{field}}\" readonly> </div> <!-- validation --> <div ng-if=\"!hideValidationMessage\" ng-show=\"showError()\" class=\"popover validation right alert-danger\" style=\"display:inline-block; top:auto; left:auto; margin-top:-4px; min-width:240px\"> <div class=\"arrow\" style=\"top: 20px\"></div> <div class=\"popover-content\" ng-include=\"'sds-angular-controls/form-directives/form-field-validation.html'\"> </div> </div> </div> </div> <div ng-if=\"layout !== 'stacked' && layout !== 'horizontal'\" ng-class=\"{ 'has-error': showError() }\" class=\"grid-control {{::layoutCss}}\"> <span ng-if=\"!valueFormatter || !isReadonly\"><ng-transclude></ng-transclude></span> <input ng-if=\"valueFormatter && isReadonly\" class=\"form-control\" type=\"text\" ng-value=\"valueFormatter()\" name=\"{{field}}\" readonly> </div> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-unsaved-modal.html',
    "<div id=\"add-control-modal\"> <div class=\"modal-header\"> <h4 class=\"modal-title\">Leave Page?</h4> </div> <div class=\"modal-body\"> <strong>You haven't saved your changes. Do you want to leave without finishing ?</strong> </div> <div class=\"modal-footer\"> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"$dismiss()\">Stay on This Page</button> <button type=\"button\" class=\"btn btn-secondary\" ng-click=\"$close('CONTINUE')\">Leave This Page</button> </div> </div>"
  );

}]);

angular.module('currencyMask', []).directive('currencyMask', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            // Run formatting on keyup
            var numberWithCommas = function(value, addExtraZero) {
                if (addExtraZero == undefined) {
                    addExtraZero = false;
                }
                value = value.toString();
                var isNegative = (value[0] === '-');
                value = value.replace(/[^0-9\.]/g, "");
                var parts = value.split('.');
                parts[0] = parts[0].replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
                if (parts[1] && parts[1].length > 2) {
                    parts[1] = parts[1].substring(0, 2);
                }
                if (addExtraZero && parts[1] && (parts[1].length === 1)) {
                    parts[1] = parts[1] + "0"
                }
                return (isNegative? '-' : '') +  parts.join(".");
            };
            var applyFormatting = function() {
                var value = element.val();
                var original = value;
                if (!value || value.length == 0) { return }
                value = numberWithCommas(value);
                if (value != original) {
                    element.val(value);
                    element.triggerHandler('input')
                }
            };
            element.bind('keyup', function(e) {
                var keycode = e.keyCode;
                var isTextInputKey =
                    (keycode > 47 && keycode < 58)   || // number keys
                    keycode == 32 || keycode == 8    || // spacebar or backspace
                    (keycode > 64 && keycode < 91)   || // letter keys
                    (keycode > 95 && keycode < 112)  || // numpad keys
                    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                    (keycode > 218 && keycode < 223);   // [\]' (in order)
                if (isTextInputKey) {
                    applyFormatting();
                }
            });
            ngModelController.$parsers.push(function(value) {
                if (!value || value.length == 0) {
                    return value;
                }
                value = value.toString();
                value = value.replace(/[^0-9\.\-]/g, "");
                return value;
            });
            ngModelController.$formatters.push(function(value) {
                if (!value || value.length == 0) {
                    return value;
                }
                value = numberWithCommas(value, true);
                return value;
            });
        }
    };
});
/* TODO: move these hacks into selectize-ng

 <select ng-if="!container.isReadonly && !reload"
 ng-readonly="container.isReadonly"
 ng-required="container.isRequired"
 name="{{::container.field}}"
 selectize="options"
 options="innerItems"
 class="{{::container.layout !== 'horizontal' ? layoutCss : ''}}"
 ng-model="container.record[container.field]"></select>
 <!-- optionValue as optionLabel for arrayItem in array -->

(function () {
    'use strict';
    function formAutocomplete ($timeout) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                items           : '=',
                groups          : '=?',
                itemKey         : '@?',
                itemValue       : '@?',
                itemSort        : '@?',
                itemGroupKey    : '@?',
                itemGroupValue  : '@?',
                dropdownDirection:'@?',
                allowCustom     : '=?'
            },
            templateUrl: 'sds-angular-controls/form-directives/form-autocomplete.html',

            link: function (scope, element, attr, container) {
                scope.container = container.$scope;
                scope.innerItems = [];
                //// hack to force reloading options
                scope.$watch("items", function(newVal, oldVal){
                    if(scope.items && !_.isArray(scope.items)){
                        scope.innerItems = convertToArray();
                    }else{
                        var i = 0;
                        scope.innerItems = _.map(scope.items, function (v){
                            v.__sort = i++;
                            return v;
                        });
                    }

                    if(newVal && newVal !== oldVal){
                        scope.reload = true;
                        $timeout(function (){
                            scope.reload = false;
                        });
                    }
                });

                // one-time bindings:
                if (attr.layoutCss && container.$scope.layout === 'horizontal'){
                    scope.$watch('layoutCss', function (){container.$scope.childLayoutCss = scope.layoutCss; });
                }


                function convertToArray(){
                    var i = 0;
                    var items = _.reduce(scope.items, function(result, item, key) {
                        //result[item["item-key"]] = item["item-value"];
                        result.push({
                            "itemKey" : key,
                            "itemValue": item,
                            "__sort": i++
                        });

                        return result;
                    }, []);
                    scope.options.valueField = "itemKey";
                    scope.options.labelField = "itemValue";
                    scope.options.searchField = ["itemValue"];
                    scope.reload = true;
                    $timeout(function (){
                        scope.reload = false;
                    });

                    return items;
                }


                var options = {
                    plugins: ['dropdown_direction'],
                    dropdownDirection: scope.dropdownDirection || 'auto',
                    valueField: scope.itemKey,
                    labelField: scope.itemValue,
                    searchField: [scope.itemValue],
                    sortField:  scope.itemSort || '__sort',
                    maxOptions: 1200
                };



                if (scope.allowCustom){
                    options.persist = false;
                    options.create = true;
                }

                if (scope.itemGroupKey && _.isArray(scope.groups)){
                    options.optgroups =  scope.groups;
                    options.optgroupField = scope.itemGroupKey;
                    options.optgroupValueField = scope.itemGroupKey;
                    options.optgroupLabelField = scope.itemGroupValue;

                    scope.$watch('groups', function (val, old){
                        if (val !== old){
                            scope.options.optgroups =  scope.groups;
                            scope.reload = true;
                            $timeout(function (){
                                scope.reload = false;
                            });
                        }
                    });
                }

                scope.options = options;
            }
        }
    }

    angular.module('sds-angular-controls').directive('formAutocomplete', formAutocomplete);

})();
*/
(function () {
  'use strict';
  function maskInput (){
    return {
      restrict: 'A',
      scope:{
        maskInput: '@'
      },
      link: function (scope, element) {
        if(scope.maskInput) {
          $(element).mask(scope.maskInput);
        }
      }
    };
  }

  angular.module('sds-angular-controls').directive('maskInput', maskInput);
})();

(function (){
    'use strict';

    function phoneNumber (){
        return function (tel) {
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country === 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    }

    angular.module('sds-angular-controls').filter('phoneNumber', phoneNumber);
})();
