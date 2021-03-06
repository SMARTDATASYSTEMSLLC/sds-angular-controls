/**
 * Created by stevegentile on 12/18/14.
 */
(function (){
  'use strict';

  angular.module('myApp', [
    'ngSanitize',
    'ngMessages',
    'toggle-switch',
    'sds-angular-controls'
  ]);

  angular.module('myApp').controller("DemoCtrl", function($timeout) {
    var vm = this;

    vm.masterTestForm = {
      FirstName: "Anakin",
      LastName: "Gentile",
      Email: "",
      PhoneNumber: "",
      Age: 25,
      City: "",
      State: "OH",
      ZipCode: "",
      Price:  5.983,
      LikesIceCream: false,
      DateOfBirth : '2015-01-07',
      weight: 100,
      weightUnit: true
    };

    vm.testForm = angular.copy(vm.masterTestForm);


    vm.states = [
      {stateCode: "OH", stateName: "Ohio"},
      {stateCode: "IN", stateName: "Indiana"},
      {stateCode: "MI", stateName: "Michigan"}
    ];

    vm.countries = [
      {continent: 'Europe', country: 'Sweeden', countryCode: 'SWE'},
      {continent: 'North America', country: 'Cananda', countryCode: 'CAN'},
      {continent: 'North America', country: 'United States', countryCode: 'USA'}
    ];
    vm.continents = [
      {continent: 'Europe'},
      {continent: 'North America'}
    ];

    vm.itemList = [];

    vm.save = function(testFrm){
      debugger;
      if(!testFrm.$invalid) {
        vm.itemList.push(vm.testForm);
        vm.testForm = angular.copy(vm.masterTestForm);
        testFrm.$setPristine(true);
        testFrm.$setDirty(false);
      }
    };

    /* Grid */

    vm.gridItems = [
      {name: 'david', age: 99}
    ];

    vm.gridItems2 = [{key:'a', value: 1}];

    $timeout(function (){
      vm.gridItems.push({name: 'Michael', age: 30});
      vm.gridItems.push({name: 'George Michael', age: 15});
      vm.gridItems.push({name: 'Michael', age: 30});
      vm.gridItems.push({name: 'George Michael', age: 15});
      vm.gridItems.push({name: 'Michael', age: 30});
      vm.gridItems.push({name: 'George Michael', age: 15});
      vm.gridItems.push({name: 'Michael', age: 30});
      vm.gridItems.push({name: 'George Michael', age: 15});
      vm.gridItems.push({name: 'Michael', age: 30});
      vm.gridItems.push({name: 'George Michael', age: 15});
      vm.gridItems.push({name: 'Michael', age: 30});
      vm.gridItems.push({name: 'George Michael', age: 15});
    }, 2000);


  });
})();
