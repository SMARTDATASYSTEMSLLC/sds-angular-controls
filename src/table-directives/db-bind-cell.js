
(function () {
    'use strict';

    // For internal use only. Manually binds a template using a provided template function, with a fallback to $compile.
    // Needs to be extremely lightweight.

    function dbBindCell ($compile) {
        return{
            restrict: 'A',
            link: function (scope, element) {
                if (typeof scope._col.template === 'function'){
                    element.append(scope._col.template(scope));

                }else if(!angular.element.trim(element.html())){

                    scope.$grid = {
                        refresh: scope._model.refresh
                    };

                    var html = angular.element('<span>' + scope._col.template  + '</span>');
                    var compiled = $compile(html) ;
                    element.append(html);
                    compiled(scope);
                    element.data('compiled', compiled);
                }
            }
        }
    }

    angular.module('sds-angular-controls').directive('dbBindCell', dbBindCell);
})();
