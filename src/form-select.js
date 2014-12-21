/**
 * Created by stevegentile on 12/19/14.
 */
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
            templateUrl: 'sds-angular-controls/form-select.html',

            link: function (scope, element, attr, formField) {
                // defaults
                scope.record     = formField.getRecord();
                scope.field      = formField.getField();
                scope.isRequired = formField.getRequired();
                scope.layout     = formField.getLayout();

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


                scope.$watch("record", function(newVal, oldVal){
                    formField.setValue(newVal[scope.field]);
                });
            }
        }
    }

    angular.module('sds-angular-controls').directive('formSelect', formSelect);
})();