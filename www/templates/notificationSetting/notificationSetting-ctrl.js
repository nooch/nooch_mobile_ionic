﻿angular.module('noochApp.notificationSettingCtrl', ['noochApp.services','noochApp.notificationSetting-service'])

.controller('notificationSettingCtrl', function ($scope,CommonServices, $state, notificationServices, $ionicLoading) {

    $scope.ChkBox = {
        TransRec: '',
        TransSent: '',
        TransRecMob: '',
    };

    $scope.$on("$ionicView.enter", function (event, data) {
        // handle event
        console.log('Notification Controller loaded');
        $scope.GetNotificationFn();
    })
       

    $scope.GetNotificationFn = function () {
        //if ($cordovaNetwork.isOnline()) {
        $ionicLoading.show({
            template: 'Loading ...'
        });     

        notificationServices.GetMemberNotificationSettings() 
          .success(function (data) {
              $scope.Data = data;

              $scope.ChkBox.TransRec = $scope.Data.EmailTransferReceived;
              $scope.ChkBox.TransSent = $scope.Data.EmailTransferSent;
              $scope.ChkBox.TransRecMob = $scope.Data.TransferReceived;

              console.log($scope.Data);
              $ionicLoading.hide();
          }).error(function (data) {
              console.log('eror' + data);
              $ionicLoading.hide();
              if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
              { CommonServices.logOut(); }
          });
      //  }
        //else {
        //    swal("Oops...", "Internet not connected!", "error");
        //}        
    }


    $scope.SetNotificationFn = function () {
        //if ($cordovaNetwork.isOnline()) {

        //$ionicLoading.show({
        //    template: 'Loading ...'
        //});
        console.log('From Controller'); 
       
        //$scope.ChkBox.TransRec == true ? "1" : "0";
        //$scope.ChkBox.TransSent == true ? "1" : "0";
        //$scope.ChkBox.TransUnclaimed == true ? "1" : "0";

        console.log($scope.ChkBox.TransRec);
        console.log($scope.ChkBox.TransSent);
        console.log($scope.ChkBox.TransUnclaimed);

        notificationServices.MemberEmailNotificationSettings($scope.ChkBox)
          .success(function (data) {
              $scope.Data = data;
              console.log($scope.Data);
              $ionicLoading.hide();
          }).error(function (data) {
              console.log('eror' + data);
              $ionicLoading.hide();
              if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
              { CommonServices.logOut(); }
          });
        //  }
        //else {
        //    swal("Oops...", "Internet not connected!", "error");
        //}        
    }


})
