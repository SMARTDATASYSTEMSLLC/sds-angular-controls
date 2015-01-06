/*! sds-angular-controls - v0.2.2 - 2015-01-06
* https://github.com/SMARTDATASYSTEMSLLC/sds-angular-controls
* Copyright (c) 2015 Steve Gentile, David Benson; Licensed  */
angular.module('sds-angular-controls', ['ui.bootstrap', 'toggle-switch', 'ngSanitize']);

(function () {
    'use strict';
    function autoNumeric (){
        var options = {};
        return {
            require: '?ngModel', // Require ng-model in the element attribute for watching changes.
            restrict: 'A',
            compile: function (tElm, tAttrs) {
                //ref: https://gist.github.com/kwokhou/5964296
                //autonumeric: https://github.com/BobKnothe/autoNumeric

                var isTextInput = tElm.is('input:text');

                return function (scope, elm, attrs, controller) {
                    // Get instance-specific options.
                    var opts = angular.extend({}, options, scope.$eval(attrs.autoNumeric));

                    // Helper method to update autoNumeric with new value.
                    var updateElement = function (element, newVal) {
                        // Only set value if value is numeric
                        if ($.isNumeric(newVal)) {
                            element.autoNumeric('set', newVal);
                        }
                    };

                    // Initialize element as autoNumeric with options.
                    elm.autoNumeric(opts);

                    // if element has controller, wire it (only for <input type="text" />)
                    if (controller && isTextInput) {
                        // watch for external changes to model and re-render element
                        scope.$watch(tAttrs.ngModel, function (current, old) {
                            controller.$render();
                        });
                        // render element as autoNumeric
                        controller.$render = function () {
                            updateElement(elm, controller.$viewValue);
                        };
                        // Detect changes on element and update model.
                        elm.on('change', function (e) {
                            scope.$apply(function () {
                                controller.$setViewValue(elm.autoNumeric('get'));
                            });
                        });
                    }
                    else {
                        // Listen for changes to value changes and re-render element.
                        // Useful when binding to a readonly input field.
                        if (isTextInput) {
                            attrs.$observe('value', function (val) {
                                updateElement(elm, val);
                            });
                        }
                    }
                };
            } // compile
        };
    }

    angular.module('sds-angular-controls').directive('autoNumeric',autoNumeric);
})();

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

    function complexFilter ($filter){
        return function(input,arg) {
            if (typeof arg === "string"){
                return $filter('filter')(input, arg);

            }else {
                var prop = function (obj, key){
                    var arr = key.split(".");
                    while(arr.length && (obj = obj[arr.shift()])); // jshint ignore:line
                    return obj;
                };


                var filters = [];
                // setup filters
                _.each(arg, function (col) {
                    if (col.type === 'date' && col.filter) {
                        var d = col.filter.split("-");
                        var d1 = moment(d[0]);
                        var d2 = moment(d[1] || d1.clone().endOf('day'));
                        if (d1.isValid() && d2.isValid()) {
                            filters.push({
                                filter: [d1.valueOf(), d2.valueOf()],
                                key: col.key,
                                type: col.type
                            });
                        }
                    } else if (col.type === 'number' && col.filter) {
                        var n = col.filter.split("-");
                        if(!n[0] && n[1]){
                            n.slice(0,1);
                            n[0] *= -1;
                        }
                        if(!n[1] && n[2]){
                            n.slice(1,1);
                            n[1] *= -1;
                        }
                        var n1 = parseFloat(n[0]);
                        var n2 = parseFloat(n[1] || n[0]);
                        filters.push({
                            filter:[n1, n2],
                            key: col.key,
                            type:col.type
                        });
                    }else if (typeof col.filter === 'string'){
                        filters.push({
                            filter:col.filter.toLowerCase(),
                            key: col.key
                        });
                    }
                });

                // run query
                return _.filter(input, function (item) {
                    return _.all(filters, function (col) {
                        if (!col.filter || !col.key) {
                            return true;
                        } else if (!col.type) {
                            return (prop(item,col.key) + "").toLowerCase().indexOf(col.filter) > -1;
                        } else if (col.type === 'date') {
                            var d = moment(prop(item,col.key)).valueOf();
                            return d >= col.filter[0] && d <= col.filter[1];
                        } else if (col.type === 'number') {
                            return prop(item,col.key) >= col.filter[0] && prop(item,col.key) <= col.filter[1];
                        }
                    });
                });
            }


        };
    }
    complexFilter.$inject = ["$filter"];

    angular.module('sds-angular-controls').filter('complexFilter', complexFilter);
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

    function page (){
        return function(input, page, size) {
            if (!input || !input.length){
                return [];
            }

            page = parseInt(page || 0, 10) || 0;
            size = parseInt(size || 0, 10);
            if (!size){
                size = 25;
            }
            return input.slice(page * size, (page+1) * size);
        };
    }

    angular.module('sds-angular-controls').filter('page', page);
})();

(function (){
    'use strict';

    function unsafe ($sce) { return $sce.trustAsHtml; }
    unsafe.$inject = ["$sce"];

    angular.module('sds-angular-controls').filter('unsafe', unsafe);
})();


(function () {
    'use strict';
    function formDatePicker ($filter, $rootScope) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                dateFormat       : '@',
                log              : '@?',
                style            : '@?',
                max              : '@?',
                min              : '@?',
                layoutCss        : '@?', //default col-md-6
                isReadonly       : '=?',  //boolean
                disableTimepicker: '=?'
            },
            templateUrl: 'sds-angular-controls/form-directives/form-datepicker.html',

            link: function (scope, element, attr, formField) {
                // defaults
                element.parent().scope().$watch('record', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.record = newVal;
                });

                element.parent().scope().$watch('field', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.field = newVal;
                });

                element.parent().scope().$watch('isRequired', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.isRequired = newVal;
                });

                element.parent().scope().$watch('layout', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.layout = newVal;
                });

                scope.isReadonly = scope.isReadonly || false;

                scope.log = scope.log || false;

                scope.disableTimepicker = scope.disableTimepicker || false;
                scope.dateFormat = scope.dateFormat || "MM-dd-yyyy";

                scope.calendar = {opened: false};
                scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    scope.calendar.opened = true;
                };

                switch(scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "col-md-4";
                }

                function checkIfReadonly(){
                    scope.readOnlyModel = moment(scope.record[scope.field]).format(scope.dateFormat);
                }
            }
        }
    }
    formDatePicker.$inject = ["$filter", "$rootScope"];

    angular.module('sds-angular-controls').directive('formDatePicker', formDatePicker);
})();

/**
 * Created by stevegentile on 12/19/14.
 */
(function () {
    'use strict';
    function formField ($filter) {
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
            controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs){


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

                //this.getRecord = function(){
                //    return $scope.record;
                //};
                //
                //this.getField = function() {
                //    return $scope.field;
                //};
                //
                //this.getRequired = function() {
                //    return $scope.isRequired;
                //};
                //
                //this.getLayout = function() {
                //    return $scope.layout;
                //};

                this.setValue = function(val){
                    $scope.record[$scope.field] = val;
                };

                $scope.showError = function(field){
                    try{
                        var form = $($element).closest("form");
                        if(form.$submitted){
                            return field.$invalid;
                        }else {
                            return field.$dirty && field.$invalid;
                        }
                    }
                    catch(err){
                        return false;
                    }
                };

                this.setMin = function (min){
                    $scope.min = min;
                };

                this.setMax = function (max){
                    $scope.max = max;
                };

            }]
        }
    }
    formField.$inject = ["$filter"];

    angular.module('sds-angular-controls').directive('formField', formField);
})();

(function () {
    'use strict';
    function formInput ($filter) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                log             : '@?',
                placeholder     : '@?',
                mask            : '@?', //todo
                style           : '@?',
                max             : '@?',
                min             : '@?',
                type            : '@',  //text, email, number etc.. see the InputTypes
                layoutCss       : '@?', //default col-md-6
                isReadonly      : '=?',  //boolean
                isNumeric       : '=?'
            },
            templateUrl: 'sds-angular-controls/form-directives/form-input.html',
            link: function (scope, element, attr, formField) {
                // defaults

                element.parent().scope().$watch('record', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.record = newVal;
                });

                element.parent().scope().$watch('field', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.field = newVal;
                });

                element.parent().scope().$watch('isRequired', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.isRequired = newVal;
                });

                element.parent().scope().$watch('layout', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.layout = newVal;
                });

                element.parent().scope().$watch('label', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.label = newVal;
                    scope.placeholder = scope.placeholder || newVal;
                });

                scope.isReadonly = scope.isReadonly || false;

                scope.log = scope.log || false;
                scope.type = scope.type || "text";


                if(scope.min) {
                    formField.setMin(scope.min);
                }

                if(scope.max) {
                    formField.setMax(scope.max);
                }

                switch(scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "col-md-4";
                }




                scope.$watch("isReadonly", function(newVal, oldVal){
                    if(newVal && oldVal) {
                        if (newVal !== oldVal) {
                            checkIfReadonly();
                        }
                    }
                });

                function checkIfReadonly(){
                    if(scope.isReadonly) {
                        if (scope.fieldType === 'toggle') {
                            scope.readOnlyModel = scope.record[scope.field];
                        }
                    }
                }
            }
        }
    }
    formInput.$inject = ["$filter"];

    angular.module('sds-angular-controls').directive('formInput', formInput);
})();

(function () {
    'use strict';
    function formSelect ($filter, $rootScope) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                items           : '=',
                itemKey         : '@?',
                itemValue       : '@?',
                log             : '@?',
                style           : '@?',
                layoutCss       : '@?', //default col-md-6
                isReadonly      : '=?'  //boolean
            },
            templateUrl: 'sds-angular-controls/form-directives/form-select.html',

            link: function (scope, element, attr, formField) {
                // defaults
                element.parent().scope().$watch('record', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.record = newVal;
                });

                element.parent().scope().$watch('field', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.field = newVal;
                });

                element.parent().scope().$watch('isRequired', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.isRequired = newVal;
                });

                element.parent().scope().$watch('layout', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.layout = newVal;
                });

                scope.isReadonly = scope.isReadonly || false;

                scope.log = scope.log || false;


                switch(scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "col-md-4";
                }

                scope.orderHash = function(obj){
                    if (!obj) {
                        return [];
                    }
                    return obj.orderedKeys || Object.keys(obj);
                };

                function convertToHash(items, itemKey, itemValue){
                    var OrderedDictionary = function (){};
                    OrderedDictionary.prototype.orderedKeys = [];
                    return _.reduce(items, function (result, item) {
                        result[item[itemKey]] = item[itemValue];

                        // set the ordered keys value
                        result.orderedKeys.push(item[itemKey]);
                        return result;
                    }, new OrderedDictionary());
                }

                function checkIfReadonly(){
                    if(scope.isReadonly) {
                        if (scope.record && scope.record[scope.field]) {

                            var value = scope.items[scope.record[scope.field]];
                            scope.readOnlyModel = value;
                        }
                    }
                }

                // If a key is numeric, javascript converts it to a string when using a foreach. This
                // tests if the key is numeric, and if so converts it back.
                scope.convertType = function (item){
                    //if the record is a string type then keep the item as a string
                    if(scope.record && scope.record[scope.field]) {
                        if (typeof scope.record[scope.field] === 'string') {
                            return item.toString();
                        }
                    }
                    //if it's a number - make sure the values are numbers
                    if (item && !isNaN(parseInt(item, 10))) {
                        return parseInt(item, 10);
                    } else {
                        return item;
                    }
                };

                scope.$watch("items", function(newVal, oldVal){
                    if(scope.items && _.isArray(scope.items)) {
                        if (scope.itemKey && scope.itemValue) {
                            scope.items = convertToHash(scope.items, scope.itemKey, scope.itemValue);
                        }
                    }
                });
            }
        }
    }
    formSelect.$inject = ["$filter", "$rootScope"];

    angular.module('sds-angular-controls').directive('formSelect', formSelect);
})();

(function () {
    'use strict';
    function formToggle ($filter) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                log             : '@?',
                placeholder     : '@?',
                toggleField     : '@?', //one-way binding
                toggleSwitchType: '@?',
                onLabel         : '@?',
                offLabel        : '@?',
                style           : '@?',
                type            : '@',  //text, email, number etc.. see the InputTypes
                layoutCss       : '@?', //default col-md-6
                isReadonly      : '=?'  //boolean
            },
            templateUrl: 'sds-angular-controls/form-toggle.html',
            link: function (scope, element, attr, formField) {
                // defaults
                element.parent().scope().$watch('record', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.record = newVal;
                });

                element.parent().scope().$watch('field', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.field = newVal;
                });

                element.parent().scope().$watch('isRequired', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.isRequired = newVal;
                });

                element.parent().scope().$watch('layout', function(newVal, oldVal){
                    //formField.setValue(newVal[scope.field]);
                    scope.layout = newVal;
                });

                scope.isReadonly = scope.isReadonly || false;

                scope.log = scope.log || false;
                scope.type = scope.type || "text";

                scope.toggleSwitchType = scope.toggleSwitchType || "primary";
                scope.onLabel = scope.onLabel   || "Yes";
                scope.offLabel = scope.offLabel || "No";


                switch(scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "col-md-4";
                }

                scope.$watch("isReadonly", function(newVal, oldVal){
                    if(newVal !== oldVal){
                        checkIfReadonly();
                    }
                });

                function checkIfReadonly(){
                    if(scope.isReadonly) {
                        if (scope.fieldType === 'toggle') {
                            scope.readOnlyModel = scope.record[scope.field];
                        }
                    }
                }
            }
        }
    }
    formToggle.$inject = ["$filter"];

    angular.module('sds-angular-controls').directive('formToggle', formToggle);
})();

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


(function () {
    'use strict';

    function dataSourceVelocity () {
        return{
            restrict: 'E',
            require: '^dbGrid',
            scope:{
                api: '@',
                postParams: '='
            },
            link: function (scope, element, attr, dbGrid) {

                function capitalize (str){
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }

                function getData(filter, sortKey, sortAsc, currentPage, pageSize, cols){
                    var query = {
                        page: currentPage,
                        pageSize: pageSize,
                        sort: [
                            {
                                field: capitalize(sortKey),
                                direction: sortAsc ? '' : 'desc'
                            }
                        ],
                        filter: createFilters(filter, cols)
                    };
                    _.extend(query, scope.postParams);

                    return $http.post(scope.api, query).then(function (response) {
                        dbGrid.setTotal(response.data.total);
                        return response.data.tableData;
                    });

                }

                function createFilters (filter, cols){
                    var result = {filters: []};
                    var dateRangeRegex = /^(\s*(\d+[-/]){2}[^-]*)-(\s*(\d+[-/]){2}[^-]*)$/;

                    if (typeof filter === 'object'){
                        var n;
                        result.logic = 'and';
                        result.filters = _.reduce(cols, function (r, item){
                            if (item.key && item.filter && item.type === 'number' && item.filter.indexOf('-') > 0){
                                n = item.filter.split('-');
                                if(!n[0] && n[1]){
                                    n.slice(0,1);
                                    n[0] *= -1;
                                }
                                if(!n[1] && n[2]){
                                    n.slice(1,1);
                                    n[1] *= -1;
                                }
                                if (_.isNumber(n[0]) && _.isNumber(n[1])) {
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'gte',
                                        fieldValue: parseFloat(n[0]),
                                        field: capitalize(item.key)
                                    });
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'lte',
                                        fieldValue: parseFloat(n[1]),
                                        field: capitalize(item.key)
                                    });
                                }

                            }else if (item.key && item.filter && item.type === 'date' && dateRangeRegex.test(item.filter)){
                                n = dateRangeRegex.exec(item.filter);

                                if (moment(n[1]).isValid() && moment(n[3]).isValid()) {
                                    r.push({
                                        fieldType: 'date',
                                        fieldOperator: 'gte',
                                        fieldValue: n[0],
                                        field: capitalize(item.key)
                                    });
                                    r.push({
                                        fieldType: 'date',
                                        fieldOperator: 'lte',
                                        fieldValue: n[1],
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'number'){
                                if (_.isNumber(item.filter)) {
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'eq',
                                        fieldValue: parseFloat(item.filter),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'date'){
                                if (moment(item.filter).isValid()) {
                                    r.push({
                                        fieldType: 'date',
                                        fieldOperator: 'eq',
                                        fieldValue: item.filter,
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter){
                                r.push({
                                    fieldType:'string',
                                    fieldOperator:'contains',
                                    fieldValue: item.filter,
                                    field: capitalize(item.key)
                                });
                            }

                            return r;
                        }, []);
                    }else if (typeof filter === 'string' && filter){
                        result.logic = 'or';
                        result.filters = _.reduce(cols, function (r, item){
                            if (item.key && item.sortable && item.type === 'number'){
                                if (_.isNumber(filter)) {
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'eq',
                                        fieldValue: parseFloat(filter),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.sortable && item.type === 'date'){
                                if (moment(filter).isValid()) {
                                    r.push({
                                        fieldType: 'date',
                                        fieldOperator: 'eq',
                                        fieldValue: filter,
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.sortable){
                                r.push({
                                    fieldType:'string',
                                    fieldOperator:'contains',
                                    fieldValue: filter,
                                    field: capitalize(item.key)
                                });
                            }
                            return r;
                        }, []);
                    }
                    return result;
                }

                dbGrid.setDataSource(getData);
            }

        }
    }

    angular.module('sds-angular-controls').directive('dataSourceVelocity', dataSourceVelocity);
})();


(function () {
    'use strict';

    // For internal use only. Manually binds a template using a provided template function, with a fallback to $compile.
    // Needs to be extremely lightweight.

    function dbBindCell ($compile) {
        return{
            restrict: 'A',
            link: function (scope, element) {

                if (typeof scope.col.template === 'function'){
                    element.append(scope.col.template(scope));

                }else if(!angular.element.trim(element.html())){
                    var html = angular.element('<span>' + scope.col.template  + '</span>');
                    var compiled = $compile(html) ;
                    element.append(html);
                    compiled(scope);
                    element.data('compiled', compiled);
                }
            }
        }
    }
    dbBindCell.$inject = ["$compile"];

    angular.module('sds-angular-controls').directive('dbBindCell', dbBindCell);
})();


(function () {
    'use strict';

    /**
     * A column definition for use in the db-grid
     *
     * <db-grid for="item in items">
     *     <db-col key="name">{{item.name}} is my name.</db-col>
     * </db-grid>
     *
     * @param {string} key      - The key to base sorting and filtering on.
     * @param {string} label    - A custom label. Defaults to key name.
     * @param {string} type     - 'string', 'number', or 'date'. Used for filtering and sorting. Defaults to 'string'.
     * @param {bool}   sortable - Whether or not the column is sortable. Defaults to true.
     * @param {bool}   bind     - Whether to use full binding on the column. True will use full binding, false will use
     *                            once-bound interpolate templates. Defaults to false.
     */
    function dbCol ($interpolate) {
        return{
            restrict: 'E',
            require: '^dbGrid',
            compile:function(tElement){
                var templateText = tElement.html().trim();
                tElement.empty();

                return function (scope, element, attr, dbGrid) {
                    var templateFunc = null;
                    if (!templateText && attr.key){
                        console.log(scope);
                        templateText = '{{' + scope.$parent.rowName + '.' + attr.key + '}}'
                    }

                    if (attr.bind === 'true'){
                        templateFunc = templateText;
                    }else{
                        templateFunc = $interpolate(templateText);
                    }

                    dbGrid.addColumn({
                        width: attr.width,
                        key: attr.key,
                        label: attr.label,
                        sortable:  attr.sortable === 'false' ? false : !!attr.key,
                        type: attr.type,
                        bind: attr.bind === 'true',
                        template: templateFunc
                    });
                }
            }
        }
    }
    dbCol.$inject = ["$interpolate"];

    angular.module('sds-angular-controls').directive('dbCol', dbCol);
})();

(function () {
    'use strict';

    /**
     * Creates a grid with sorting, paging, filtering, and the ability to add custom data sources.
     * Can contain custom toolbar buttons, a custom data source element, and a list of db-cols.
     *
     * <db-grid for="items in item">
     *     <db-column key="name"></db-column>
     * </db-grid>
     *
     * @param {string}     format    - A label to put next to the count (TODO: make this customizable)
     * @param {string}     layoutCss - A css class to add to the table
     * @param {string}     filter    - One of the options 'none', 'simple' or 'advanced'. Defaults to 'advanced'. Bound once.
     * @param {int}        pageSize  - The page size, defaults to 25. Bound once.
     * @param {expression} for       - Required. Either 'item in items' or (when used with a custom data source) just 'item'
     */
    function dbGrid ($filter, $timeout, $q) {
        return {
            restrict: 'E',
            replace: true,
            transclude:true,
            scope: {
                label: '@',
                layoutCss: '@'
            },
            templateUrl: 'sds-angular-controls/table-directives/db-grid.html',
            compile: function (tElement, tAttrs){
                var loop = tAttrs.for.split(' ');
                if (loop.length !== 1 && loop[1] != 'in') {
                    console.error('Invalid loop');
                    return;
                }

                tElement.find('tbody > tr').attr('ng-repeat', loop[0] + ' in model.filteredItems');

            },
            controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs){
                var complexFilter = $filter('complexFilter');
                var orderByFilter = $filter('orderBy');
                var pageFilter = $filter('page');

                $scope.model = {
                    currentPage: 1,
                    total: 0,
                    sortAsc: false,
                    sort: null,
                    filterText: '',
                    showAdvancedFilter: false,
                    pageSize: $attrs.pageSize ? parseInt($attrs.pageSize, 10) : 25,
                    filterType: ($attrs.filter || 'advanced').toLowerCase(),
                    cols: [],
                    items: [],
                    filteredItems: [],
                    getItems: defaultGetItems,
                    toggleSort: toggleSort,
                    clearFilters: clearFilters,
                    onEnter: onEnter,
                    refresh: _.debounce(refresh, 250)
                };

                var loop = $attrs.for.split(' ');
                $scope.rowName = loop[0];
                if (loop[2]) {
                    $element.parent().scope().$watch(loop.slice(2).join(' '), function (items) {
                        $scope.model.items = items;
                        refresh();
                    });
                }

                function defaultGetItems (filter, sortKey, sortAsc, page, pageSize, cols){
                    var deferred = $q.defer();
                    var items = orderByFilter(complexFilter($scope.model.items, filter), sortKey, sortAsc);
                    $scope.model.total = items.length;
                    deferred.resolve(pageFilter(items, page, pageSize));
                    return deferred.promise;
                }

                function toggleSort(index){
                    console.log(index);
                    if ($scope.model.sort === index)  {
                        $scope.model.sortAsc = !$scope.model.sortAsc;
                    }else{
                        $scope.model.sort = index;
                    }
                }

                function clearFilters(){
                    _.each($scope.model.cols, function (item){
                       item.filter = '';
                    });
                    refresh();
                }

                function onEnter(){
                    console.log('enter');
                    if ($scope.model.items.length === 1){
                        $timeout(function (){
                            $element.find('tbody tr a:first').click();
                        });
                    }
                }

                function refresh() {
                    $timeout(function () {
                        $scope.model.getItems(
                            $scope.model.showAdvancedFilter ? $scope.model.cols : $scope.model.filterText,
                            $scope.model.sort ? $scope.model.cols[$scope.model.sort].key : null,
                            $scope.model.sortAsc,
                            $scope.model.currentPage - 1,
                            $scope.model.pageSize,
                            $scope.model.cols
                        ).then(function (result){
                            $scope.model.filteredItems = result;
                        });
                    });
                }

                this.addColumn = function (item){
                    $scope.model.cols.push(item);
                };

                this.setDataSource = function (dataSource){
                    $scope.model.getItems = dataSource;
                    refresh();
                };

                this.setTotal = function (total){
                    $scope.model.total = total;
                };

                $scope.$watch('model.currentPage', $scope.model.refresh);
                $scope.$watch('model.sort',        $scope.model.refresh);
                $scope.$watch('model.sortAsc',     $scope.model.refresh);
                $scope.$watch('model.filterText',  $scope.model.refresh);
            }]
        };
    }
    dbGrid.$inject = ["$filter", "$timeout", "$q"];

    angular.module('sds-angular-controls').directive('dbGrid', dbGrid);

})();

angular.module('sds-angular-controls').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('sds-angular-controls/form-directives/form-datepicker.html',
    "<span class=\"input-group\"> <input type=\"text\" style=\"{{::style}}\" class=\"form-control datepicker\" ng-if=\"!isReadonly\" ng-readonly=\"isReadonly\" placeholder=\"{{placeholder}}\" ng-model=\"record[field]\" ng-required=\"::isRequired\" min-date=\"::min\" max-date=\"::max\" datepicker-popup=\"{{::dateFormat}}\" is-open=\"calendar.opened\"> <span ng-if=\"!isReadonly\" class=\"input-group-btn\"> <button type=\"button\" class=\"btn btn-default\" ng-click=\"open($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button> </span> </span>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-field.html',
    "<div> <script type=\"text/ng-template\" id=\"validation.html\"><div ng-if=\"!hideValidationMessage\" class='has-error' ng-show='showError({{field}})'\n" +
    "             ng-messages='{{field}}.$error'>\n" +
    "            <span class='control-label' ng-message='required'> {{ validationFieldName }} is required. </span>\n" +
    "            <span class='control-label' ng-message='text'> {{ validationFieldName }} should be text. </span>\n" +
    "            <span class='control-label' ng-message='email'> {{ validationFieldName }} should be an email address. </span>\n" +
    "            <span class='control-label' ng-message='date'> {{ validationFieldName}} should be a date. </span>\n" +
    "            <span class='control-label' ng-message='datetime'> {{ validationFieldName }} should be a datetime. </span>\n" +
    "            <span class='control-label' ng-message='time'> {{ validationFieldName }} should be a time. </span>\n" +
    "            <span class='control-label' ng-message='month'> {{ validationFieldName }} should be a month. </span>\n" +
    "            <span class='control-label' ng-message='week'> {{ validationFieldName }} should be a week. </span>\n" +
    "            <span class='control-label' ng-message='url'> {{ validationFieldName }} should be an url. </span>\n" +
    "            <span class='control-label' ng-message='zip'> {{ validationFieldName }} should be a valid zipcode. </span>\n" +
    "            <span class='control-label' ng-message='number'>{{ validationFieldName }} must be a number</span>\n" +
    "            <span class='control-label' ng-message='tel'>{{ validationFieldName }} must be a phone number</span>\n" +
    "            <span class='control-label' ng-message='color'>{{ validationFieldName }} must be a color</span>\n" +
    "            <span class='control-label' ng-message='min'> {{ validationFieldName }} must be at least {{min}}. </span>\n" +
    "            <span class='control-label' ng-message='max'> {{ validationFieldName }} must not exceed {{max}} </span>\n" +
    "            <span class='control-label' ng-repeat='(k, v) in types' ng-message='{{k}}'> {{ validationFieldName }}{{v[1]}}</span>\n" +
    "        </div></script> <div ng-if=\"layout === 'stacked'\" class=\"row\"> <div class=\"form-group clearfix\" ng-form=\"{{field}}\" ng-class=\"{ 'has-error': showError({{field}}) }\"> <div class=\"{{::layoutCss}}\"> <label ng-if=\"showLabel\" class=\"control-label {{labelCss}}\"> {{ label }} <span ng-if=\"isRequired && !isReadonly\">*</span></label> <ng-transclude></ng-transclude> <!-- validation --> <div class=\"pull-left\" ng-include=\"'validation.html'\"></div> </div> </div> </div> <div ng-if=\"layout === 'horizontal'\" class=\"row\"> <div class=\"form-group\" ng-form=\"{{field}}\" ng-class=\"{ 'has-error': showError({{field}}) }\"> <label ng-if=\"showLabel\" class=\"control-label {{labelCss}}\"> {{ label }} <span ng-if=\"isRequired && !isReadonly\">*</span></label> <ng-transclude></ng-transclude> <!-- validation --> <div class=\"pull-right\" ng-include=\"'validation.html'\"></div> </div> </div> <div ng-if=\"layout === 'grid'\" ng-form=\"{{field}}\" ng-class=\"{ 'has-error': showError({{field}}) }\"> <ng-transclude></ng-transclude> </div> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-input.html',
    "<div> <div class=\"{{layout === 'horizontal' ? layoutCss : '' }}\"> <input ng-if=\"!isNumeric\" class=\"form-control inputField {{layout === 'stacked' ? layoutCss : ''}}\" ng-model=\"record[field]\" type=\"{{::type}}\" ng-required=\"isRequired\" ng-disabled=\"isReadonly\" placeholder=\"{{::placeholder}}\" max=\"{{::max}}\" min=\"{{::min}}\" style=\"{{::style}}\" mask-input=\"{{::mask}}\"> <input ng-if=\"isNumeric\" class=\"form-control inputField {{layout === 'stacked' ? layoutCss : ''}}\" ng-model=\"record[field]\" type=\"{{::type}}\" ng-required=\"isRequired\" ng-disabled=\"isReadonly\" placeholder=\"{{::placeholder}}\" max=\"{{::max}}\" min=\"{{::min}}\" style=\"{{::style}}\" mask-input=\"{{::mask}}\" auto-numeric> <div ng-if=\"log\"> form-input value: {{record[field]}}<br> {{isRequired}} </div> </div> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-select.html',
    "<div> <select ng-if=\"!isReadonly && !hasFilter\" ng-readonly=\"isReadonly\" class=\"form-control\" name=\"{{::field}}\" ng-model=\"record[field]\" ng-options=\"convertType(key) as items[key] for key in orderHash(items)\" ng-required=\"isRequired\"></select> <!-- optionValue as optionLabel for arrayItem in array --> <input ng-if=\"isReadonly\" style=\"{{::style}}\" ng-readonly=\"isReadonly\" type=\"text\" class=\"form-control inputField {{::inputLayoutCss}}\" ng-model=\"readOnlyModel\"> <div ng-if=\"log\"> form-input value: {{record[field]}}<br> {{isRequired}} </div> </div>"
  );


  $templateCache.put('sds-angular-controls/form-toggle.html',
    "<div> <!-- bug in toggle where setting any disabled makes it disabled - so needing an if here --> <toggle-switch ng-if=\"isReadonly\" style=\"{{::style}}\" disabled class=\"{{::toggleSwitchType}}\" ng-model=\"record[field]\" on-label=\"{{::onLabel}}\" off-label=\"{{::offLabel}}\"> </toggle-switch> <toggle-switch ng-if=\"!isReadonly\" style=\"{{::style}}\" class=\"{{::toggleSwitchType}}\" ng-model=\"record[field]\" on-label=\"{{::onLabel}}\" off-label=\"{{::offLabel}}\"> </toggle-switch> <div ng-if=\"log\"> form-input value: {{record[field]}}<br> {{isRequired}} </div> </div>"
  );


  $templateCache.put('sds-angular-controls/table-directives/db-grid.html',
    "<div class=\"table-responsive\"> <div class=\"btn-toolbar\"> <a ng-if=\"model.showAdvancedFilter\" href=\"\" class=\"btn btn-default\" ng-click=\"model.clearFilters()\">Clear All Filters <span class=\"big-x\">&times;</span></a> <div ng-if=\"!model.showAdvancedFilter && model.filterType !== 'none'\" class=\"toolbar-input\"> <div class=\"form-group has-feedback\"> <input class=\"form-control\" type=\"text\" ng-model=\"model.filterText\" placeholder=\"Filter {{label || 'items'}}\" on-enter=\"model.onEnter()\"> <a href=\"\" ng-click=\"model.filterText = ''\" class=\"form-control-feedback feedback-link\">&times;</a> </div> </div> <a href=\"\" ng-if=\"model.filterType === 'advanced'\" class=\"btn btn-default\" ng-class=\"{active: model.showAdvancedFilter}\" ng-click=\"model.showAdvancedFilter = !model.showAdvancedFilter\">Advanced Filtering</a> <ng-transclude></ng-transclude> <p ng-if=\"data && label\"><i>{{model.total}} {{label}}</i></p> </div> <table class=\"table table-hover {{layoutCss}}\"> <thead> <tr> <th ng-repeat=\"col in model.cols\" ng-style=\"{width: col.width}\"> <div ng-if=\"model.showAdvancedFilter && col.sortable\"> <input type=\"text\" class=\"form-control filter-input\" on-enter=\"model.onEnter()\" ng-keyup=\"model.refresh();\" ng-model=\"col.filter\" placeholder=\"Filter {{::col.label || col.key}}\" tooltip=\"{{col.type ? 'Use a dash (-) to specify a range' : ''}}\" tooltip-trigger=\"focus\" tooltip-placement=\"top\"> </div> <a href=\"\" ng-if=\"::col.sortable\" ng-click=\"model.toggleSort($index)\">{{::col.label || (col.key | labelCase) }} <i class=\"fa\" ng-class=\"{\n" +
    "                         'fa-sort'     : model.sort !== $index,\n" +
    "                         'fa-sort-down': model.sort === $index &&  model.sortAsc,\n" +
    "                         'fa-sort-up'  : model.sort === $index && !model.sortAsc\n" +
    "                         }\"></i> </a> <span ng-if=\"::!col.sortable\"> {{::col.label || (col.key | labelCase)}} </span>    <tbody> <tr> <td ng-repeat=\"col in model.cols\" db-bind-cell>   </table> <pagination ng-if=\"model.total > model.pageSize\" total-items=\"model.total\" items-per-page=\"model.pageSize\" max-size=\"10\" rotate=\"false\" ng-model=\"model.currentPage\"></pagination> </div>"
  );

}]);
