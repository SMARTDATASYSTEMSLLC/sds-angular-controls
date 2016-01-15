/**
 * Created by stevegentile on 8/31/15.
 */
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

    angular.module('sds-angular-controls').directive('formUnsaved', formUnsaved);
})();