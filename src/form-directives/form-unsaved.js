(function(){
    'use strict';
    function formUnsaved ($location, $modal, progressLoader) {
        return {
            restrict: 'A',
            require: '^form',
            link: function($scope, element, attrs, form){
                function routeChange(event) {
                    if(form.$dirty){
                        progressLoader.endAll();
                        event.preventDefault();
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

    angular.module('sds-angular-controls').directive('formUnsaved', formUnsaved);
})();
