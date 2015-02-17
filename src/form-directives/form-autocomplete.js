/**
 * Created by stevegentile on 12/19/14.
 */
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
                allowCustom     : '=?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-autocomplete.html',

            link: function (scope, element, attr, container) {
                var input = element.find('select');
                scope.container = container.$scope;

                // one-time bindings:
                switch(container.$scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "";
                }

                if (container.$scope.isAutofocus){
                    $timeout(function (){input.focus(); });
                }

                scope.$watch("container.isReadonly", function(newVal){
                    if(newVal) {
                        if (scope.container.record && scope.container.record[scope.container.field]) {

                            var value = scope.items[scope.container.record[scope.container.field]];
                            //if using itemKey/itemValue -we need to find it in the array vs. hash:
                            if(scope.itemValue && scope.itemKey){
                                var arrayItem = _.find(scope.items, function(item){
                                    return item[scope.itemKey] === scope.container.record[scope.container.field];
                                });
                                value = arrayItem[scope.itemValue];
                            }
                            scope.readOnlyModel = value;
                        }
                    }
                });

                var options = {
                    valueField: scope.itemKey,
                    labelField: scope.itemValue,
                    sortField : scope.itemSort || scope.itemValue,
                    searchField: [scope.itemValue],
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
                }

                scope.options = options;
            }
        }
    }

    angular.module('sds-angular-controls').directive('formAutocomplete', formAutocomplete);
})();
