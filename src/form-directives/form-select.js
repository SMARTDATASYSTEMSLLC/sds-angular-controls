/**
 * Created by stevegentile on 12/19/14.
 */
(function () {
    'use strict';
    function formSelect ($timeout) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                items           : '=',
                itemKey         : '@?',
                itemValue       : '@?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-select.html',

            link: function (scope, element, attr, container) {
                var input = element.find('select');
                scope.container = container.$scope;
                scope.innerItems = {};

                scope.$watch("items", function(newVal, oldVal){

                    if(scope.items && _.isArray(scope.items)) {
                        if (scope.itemKey && scope.itemValue) {
                            scope.innerItems = convertToHash(scope.items, scope.itemKey, scope.itemValue);
                        }
                    }else{
                        scope.innerItems = scope.items;
                    }
                });

                // one-time bindings:
                if (attr.layoutCss && container.$scope.layout === 'horizontal'){
                    scope.watch('layoutCss', function (){container.$scope.childLayoutCss = scope.layoutCss; });
                }

                if (container.$scope.isAutofocus){
                    $timeout(function (){element.find('select').focus(); });
                }

                scope.$watch("container.isReadonly", function(newVal){
                    if(newVal) {
                        if (scope.container.record && scope.container.record[scope.container.field]) {

                            var value = scope.innerItems[scope.container.record[scope.container.field]];
                            //if using itemKey/itemValue -we need to find it in the array vs. hash:
                            if(scope.itemValue && scope.itemKey){
                                var arrayItem = _.find(scope.innerItems, function(item){
                                   return item[scope.itemKey] === scope.container.record[scope.container.field];
                                });
                                value = arrayItem[scope.itemValue];
                            }
                            scope.readOnlyModel = value;
                        }
                    }
                });

                scope.orderHash = function(obj){
                    if (!obj) {
                        return [];
                    }
                    return obj.orderedKeys || Object.keys(obj);
                };

                function getChild (obj, key){
                    var arr = key.split(".");
                    while(arr.length && (obj = obj[arr.shift()])); // jshint ignore:line
                    return obj;
                }

                function convertToHash(items, itemKey, itemValue){
                    var OrderedDictionary = function (){};
                    OrderedDictionary.prototype.orderedKeys = [];
                    return _.reduce(items, function (result, item) {
                        var key = getChild(item, itemKey);
                        var val = getChild(item, itemValue);
                        result[key] = val;

                        // set the ordered keys value
                        result.orderedKeys.push(key);
                        return result;
                    }, new OrderedDictionary());
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
                    if (item && !isNaN(item)) {
                        return parseInt(item, 10);
                    } else {
                        return item;
                    }
                };


            }
        }
    }

    angular.module('sds-angular-controls').directive('formSelect', formSelect);
})();
