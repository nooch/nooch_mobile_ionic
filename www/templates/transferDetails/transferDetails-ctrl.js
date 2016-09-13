﻿angular.module('noochApp.transferDetailsCtrl', ['noochApp.enterPinForeground-service', 'noochApp.transferDetails-service', 'noochApp.services', 'ngMap'])

       .controller('transferDetailsCtrl', function ($scope, $stateParams, transferDetailsService, $ionicLoading, $localStorage, $state, $ionicModal, CommonServices, ValidatePin, $rootScope, $ionicPlatform, NgMap, $cordovaGoogleAnalytics) {

           $ionicModal.fromTemplateUrl('templates/transferDetails/modalPin.html', {
               scope: $scope,
               animation: 'slide-in-up'
           }).then(function (modal) {
               $scope.modal = modal;
           });

           $scope.transDetail = {};

           $scope.$on("$ionicView.enter", function (event, data) {
               console.log('Transfer Details Cntrlr Fired');

               $rootScope.Location = {
                   longi: '',
                   lati: ''
               }

               $scope.hasLatiLongi = false;
               $scope.hasPicture = false;

               var vm = this;
               NgMap.getMap().then(function (map) {

                   //console.log(map.getCenter());
                   //console.log('markers', map.markers);
                   //console.log('shapes', map.shapes);

                   vm.showCustomMarker = function (evt) {
                       map.customMarkers.foo.setVisible(true);
                       map.customMarkers.foo.setPosition(this.getPosition());
                   }

                   vm.closeCustomMarker = function (evt) {
                       this.style.display = 'none';
                   }
               });

               console.log('Transaction Obj -> ' + JSON.stringify($stateParams.trans));

               // Make sure there is a transaction object available
               if ($stateParams.trans == null) $state.go('app.history');
               else
               {
                   $scope.transDetail = $stateParams.trans;
                   $scope.memId = $localStorage.GLOBAL_VARIABLES.MemberId;

                   //$rootScope.Location.lati = $scope.transDetail.Latitude;
                   //$rootScope.Location.longi = $scope.transDetail.Longitude;

                   if (($scope.transDetail.Latitude != '' && $scope.transDetail.Longitude != '') && ($scope.transDetail.Latitude != 0 && $scope.transDetail.Longitude != 0 )){
                       $scope.hasLatiLongi = true;
                       $rootScope.Location.lati = $scope.transDetail.Latitude;
                       $rootScope.Location.longi = $scope.transDetail.Longitude
                       console.log(" Lati Longis are ---> ");
                       console.log($rootScope.Location.longi);
                       console.log($rootScope.Location.lati);
                   }
                   if ($scope.transDetail.Picture != null) {
                       $scope.hasPicture = true;
                       //console.log(" This is HasPicture --->  " + $scope.transDetail.Picture);
                   }

                   //console.log($rootScope.Location.longi);
                   //console.log($rootScope.Location.lati);

                   $scope.typeLabelTxt = "";
                   $scope.labelTypeClr = "";

                   if (($scope.transDetail.TransactionType == 'Transfer' ||
                        $scope.transDetail.TransactionType == 'Invite'))
                   {
                       if ($scope.transDetail.MemberId == $scope.memId)
                       {
                           $scope.typeLabelTxt = "Transfer To";
                           $scope.labelTypeClr = "red";
                       }
                       else if ($scope.transDetail.MemberId != $scope.memId)
                       {
                           $scope.typeLabelTxt = "Transfer From";
                           $scope.labelTypeClr = "green";
                       }
                   }
                   else if ($scope.transDetail.TransactionType == 'Request')
                   {
                       if ($scope.transDetail.MemberId == $scope.memId)
                       {
                           $scope.typeLabelTxt = "Request To";
                           $scope.labelTypeClr = "blue";
                       }
                       else if ($scope.transDetail.MemberId != $scope.memId)
                       {
                           $scope.typeLabelTxt = "Request From";
                           $scope.labelTypeClr = "blue";
                       }
                   }
                   else if ($scope.transDetail.TransactionType == 'Reward')
                   {
                       if ($scope.transDetail.MemberId != $scope.memId)
                       {
                           $scope.typeLabelTxt = "Reward From";
                           $scope.labelTypeClr = "green";
                       }
                   }
                   else if ($scope.transDetail.TransactionType == 'Rent')
                   {
                       if ($scope.transDetail.MemberId == $scope.memId)
                       {
                           $scope.typeLabelTxt = "Rent To";
                           $scope.labelTypeClr = "red";
                       }
                       else if ($scope.transDetail.MemberId != $scope.memId)
                       {
                           $scope.typeLabelTxt = "Rent From";
                           $scope.labelTypeClr = "green";
                       }
                   }

                   $scope.mapGeoLabelTxt = "";
                   if ($scope.transDetail.City != null && $scope.transDetail.City.length > 0)
                   {
                       $scope.mapGeoLabelTxt = $scope.transDetail.City;

                       if ($scope.transDetail.State != null && $scope.transDetail.State.length > 0)
                           $scope.mapGeoLabelTxt += ", " + $scope.transDetail.State;
                   }
               }

               $ionicPlatform.ready(function () {
                   if (typeof analytics !== undefined) analytics.trackView("transferDetails Controller");                   
               })
           })

           $scope.remindPayment = function () {

               $ionicLoading.show({
                   template: 'Sending Reminder ...'
               });

               transferDetailsService.RemindPayment($scope.transDetail.TransactionId).success(function (data) {
                   if (data.Result.indexOf('successfully') > -1)
                   {
                       swal("Sent...", data.Result, "success");
                       $ionicLoading.hide();
                       $state.go('app.history');
                   }
                   else
                   {
                       swal("Error...", data.Result, "error");
                       $ionicLoading.hide();
                   }

               }).error(function (data) {
                   $ionicLoading.hide();
                   //  if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
                   { CommonServices.logOut(); }
               });
           }

           $scope.cancelPayment = function () {

               console.log("cancel payment: [" + $scope.transDetail.TransactionId + ']');
               $ionicLoading.show({
                   template: 'Cancelling Request...'
               });
               transferDetailsService.CancelRequest($scope.transDetail.TransactionId).success(function (data) {
                   if (data.Result.indexOf('Successfully') > -1)
                   {
                       swal({ title: "Request Cancelled", text: data.Result, type: "success", confirmButtonColor: "#DD6B55", confirmButtonText: "Ok!" }, function () {
                           $ionicLoading.hide();
                           $state.go('app.history');
                       });

                   }

               }).error(function (data) {
                   $ionicLoading.hide();
                   // if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
                   { CommonServices.logOut(); }
               });
           }

           $scope.rejectPayment = function () {

               console.log("cancel payment" + $scope.transDetail.TransactionId);
               $ionicLoading.show({
                   template: 'Rejecting Request...'
               });
               transferDetailsService.RejectPayment($scope.transDetail.TransactionId).success(function (data) {
                   if (data.Result.indexOf('Successfully') > -1)
                   {
                       swal({ title: "Request Rejected", text: data.Result, type: "success", confirmButtonColor: "#DD6B55", confirmButtonText: "Ok!" }, function () {
                           $ionicLoading.hide();
                           $state.go('app.history');
                       });

                   }
                   $ionicLoading.hide();
               }).error(function (data) {
                   $ionicLoading.hide();
                   // if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
                   { CommonServices.logOut(); }
               });;
           }


           // CLIFF (7/31/16): THIS SHOULD NOT BE HERE. IF THE USER TAPS 'Pay' (for a Request they Received), IT SHOULD
           //                  SEND THE USER TO THE 'PIN' SCREEN TO COMPLETE THE PAYMENT.
           //                  IF THE USER TAPS 'Pay Back', IT SHOULD SEND THE USER TO THE 'HOW MUCH?' SCREEN SO THEY
           //                  CAN ENTER AN AMOUNT, THEN TO 'PIN' TO COMPLETE.
           $scope.TransferMoney = function () {

               $scope.transDetail.RecepientName = $scope.transDetail.Name;
 
               CommonServices.savePinValidationScreenData({ myParam: $scope.transDetail, type: 'transfer', returnUrl: 'app.transferDetails', returnPage: 'Transfer Details', comingFrom: 'Transfer' });
               
 
               $state.go('enterPin');
               //  $scope.modal.show();
           }

 

           $scope.PayBack = function () {
               console.log("Pay Back" + JSON.stringify($scope.transDetail));
               $state.go('app.howMuch', { myParam: $scope.transDetail });;
           }

       })