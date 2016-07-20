﻿angular.module('noochApp.historyCtrl', ['noochApp.history-service', 'noochApp.services'])

/*****************/
/***  HISTORY  ***/
/*****************/
    .controller('historyCtrl', function ($scope, historyService, $ionicLoading) {

        $scope.$on("$ionicView.enter", function(event, data) {

            console.log('History Page Loaded');
        });
        $ionicLoading.show({
            template: 'Loading ...'
        });
        historyService.getTransferList().success(function (data) {
            $scope.transactionList = data;
            console.log($scope.transactionList);
            $ionicLoading.hide();
        }).error(function (data) {
            console.log('eror'+data);
        });
    });

