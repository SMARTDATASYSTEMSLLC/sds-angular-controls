(function(){
    'use strict';
    function formUnsaved ($location, $uibModal, progressLoader) {
        return {
            restrict: 'A',
            require: '^form',
            link: function($scope, element, attrs, form){
                function routeChange(event) {
                    if(form.$dirty){
                        progressLoader.endAll();
                        event.preventDefault();
                        var targetPath = $location.path();

                        $uibModal.open({
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
        };
    }

    angular.module('sds-angular-controls').directive('formUnsaved', formUnsaved);
})();
