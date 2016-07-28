﻿angular.module('noochApp.SelectRecipCtrl', ['noochApp.selectRecipientService', 'noochApp.services', 'ion-sticky'])

/************************/
/*** SELECT RECIPIENT ***/
/************************/
.controller('SelectRecipCtrl', function ($scope, $state, $localStorage, $cordovaContacts, selectRecipientService,$ionicLoading) {
    $scope.$on("$ionicView.enter", function (event, data) {
        console.log('SelectRecipCtrl Fired');
        $scope.FindRecent();
         
      // to check contacts authorization
      // cordova.plugins.diagnostic.isContactsAuthorized(function(authorized){
      //   console.log("App is " + (authorized ? "authorized" : "denied") + " access to contacts");
      // }, function(error){
      //   console.error("The following error occurred: "+error);
      // });


      // to request contact authorization

      // cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
      //   if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
      //     console.log("Contacts use is authorized");
      //   }
      //   else
      //   {
      //     console.log("Contact permisison is "+ status);
      //   }
      // }, function(error){
      //   console.error(error);
      // });



      // to check contacts authorization status
      // cordova.plugins.diagnostic.getContactsAuthorizationStatus(function(status){
      //   if(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED){
      //     console.log("Contacts use never asked");
      //
      //   }
      //   else{
      //     console.log("came in contacts status else part");
      //   }
      // }, function(onError){
      //
      //   console.log("came in error outer "+onError);
      // });


      // cordova.plugins.diagnostic.getContactsAuthorizationStatus(function(status){

      //   // status === authorized    -- in case user has authorized  and by default it will same

      //   // status === denied   -- in case turned of contacts permission from settings in iphone
      //     console.log("Contact Authorization status is "+status);
      //   console.log("Contact Authorization status is "+ JSON.stringify( status));

      // }, function(onError){

      //   console.log("came in error outer "+onError);
      // });


      cordova.plugins.diagnostic.requestContactsAuthorization(function(status){

        console.log("Contact Authorization status is "+status);

      }, function(error){
        console.error(error);
      });

      if($localStorage)
      {
        if($localStorage.GLOBAL_VARIABLES.shouldNotDisplayContactsAlert==false && $localStorage.GLOBAL_VARIABLES.HasSharedContacts==true)
        {

        }
      }


    });

    $scope.GoBack = function () {
        $state.go('home');
    };

    $scope.go = function (data) {
        if (data == 'howMuch')
        {
            $state.go('howMuch');
        }
    }

    $scope.FindRecent = function () {
        $ionicLoading.show({
            template: 'Loading ...'
        });
        selectRecipientService.GetRecentMembers().success(function (data) {

            $scope.memberList = data;
            $ionicLoading.hide();
        }).error(function (data) { console.log(data); $ionicLoading.hide(); });

    }

    $scope.GetLocationSearch = function () {
        $ionicLoading.show({
            template: 'Loading ...'
        });
        selectRecipientService.GetLocationSearch().success(function (data) {

            $scope.memberList = data;
            $ionicLoading.hide();
        }).error(function (data) {
            console.log(data);
            $ionicLoading.hide();
        });

    }
})
