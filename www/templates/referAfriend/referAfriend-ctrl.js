﻿angular.module('noochApp.referAfriendCtrl', ['noochApp.services', 'noochApp.referAfriend-service'])

 .controller('referAfriendCtrl', function ($scope, authenticationService, $ionicPlatform, $cordovaSocialSharing,
                                           $cordovaNetwork, $ionicLoading, $localStorage, $cordovaGoogleAnalytics,
                                           ReferralCodeService, CommonServices) {

     $scope.$on("$ionicView.beforeEnter", function (event, data) {
         $scope.referredUsersCount = 0;
     });


     $scope.$on("$ionicView.enter", function (event, data) {
         //console.log("Refer a Friend Controller Loaded");

         $ionicLoading.show({
             template: 'Loading...'
         });

         $scope.getReferralCode();

         $ionicPlatform.ready(function () {
             if (typeof analytics !== 'undefined') analytics.trackView("Refer A Friend");
         })
     });


     $scope.getReferralCode = function () {
         //if ($cordovaNetwork.isOnline()) {
         ReferralCodeService.getReferralCode()
             .success(function (Code) {
                 $scope.inviteCode = Code.Result;

                 $scope.getReferredUsersList();
             })
             .error(function (error) {
                 console.log('GetReferralCode Error: [' + JSON.stringify(error) + ']');
                 $ionicLoading.hide();
                 if (error != null && error.ExceptionMessage == 'Invalid OAuth 2 Access')
                     CommonServices.logOut();
                 else if (error != null)
                     CommonServices.DisplayError('Unable to find your referral code :-(');
             })
         //}
         //else
         //    swal("Error", "Internet not connected!", "error");
     }


     $scope.getReferredUsersList = function () {
         //if ($cordovaNetwork.isOnline()) {
         ReferralCodeService.getInvitedMemberList()
           .success(function (data) {
               $scope.memberList = data;
               //console.log('Referred Users List -->');
               //console.log($scope.memberList);

               if ($scope.memberList != null && $scope.memberList.length > 0)
               {
                   $scope.referredUsersCount = $scope.memberList.length;

                   if ($scope.memberList[0].Photo == "")
                       $scope.memberList[0].Photo = "./img/profile_picture.png";
               }

               $ionicLoading.hide();
           })
		   .error(function (error) {
		       console.log('getInvitedMemberList Error: [' + JSON.stringify(error) + ']');
		       $ionicLoading.hide();
		       if (error != null && error.ExceptionMessage == 'Invalid OAuth 2 Access')
		           CommonServices.logOut();
		       else if (error != null)
		           CommonServices.DisplayError('Unable to get invited friends list :-(');
		   });
         //  }
         //else
         //    swal("Error", "Internet not connected!", "error");
     }

     $scope.sendReferralCode = function (type) {
         //console.log(type + " clicked");

         if (window.cordova)
         {
             var imageURL = "http://noochme.com/noochweb/Assets/Images/noochlogosquare.png";
             var addUrl = "http://bit.ly/1xdG2le";

             if (type == "sms")
             {
                 var msg = "Hey! You should check out Nooch, a great free app for paying me back. Use my invite code: \"" + $scope.inviteCode + "\" - download here: http://bit.ly/1xdG2le";

                 $ionicPlatform.ready(function () {
                     $cordovaSocialSharing
                       .shareViaSMS(msg, "")
                       .then(function (res) {
                       }, function (err) {
                           CommonServices.DisplayError('Oh no! Unable to send a text msg right now.');
                       });
                 });
             }
             else if (type == "fb")
             {
                 var shareDesc = "Check out Nooch, the simple, free, and PRIVATE way to pay me back!";

                 $ionicPlatform.ready(function () {
                     $cordovaSocialSharing
                        .shareViaFacebook(shareDesc, imageURL, addUrl)
                        .then(function (res) {
                        }, function (err) {
                            CommonServices.DisplayError('Oh no! Unable to send a message right now.');
                        });
                 });
             }
             else if (type == "twitter")
             {
                 var tweetTxt = "Check out @NoochMoney, the simple, free, & PRIVATE way to pay me back! ";

                 $ionicPlatform.ready(function () {
                     $cordovaSocialSharing
                        .shareViaTwitter(tweetTxt, imageURL, addUrl)
                        .then(function (res) {
                        }, function (err) {
                            CommonServices.DisplayError('Oh no! Unable to send a tweet right now.');
                        });
                 });
             }
             else if (type == "email")
             {
                 var subject = "Check out Nooch - a free app to pay me back";
                 var msgBody = "Hey there,<br/><p>You should check out Nooch, a great <strong>free app</strong> that lets me pay you back anytime, anywhere.  " +
                               "Since I know you don't like carrying cash around either, I thought you would love using Nooch!</p>" +
                               "<p>You can <a href=\"https://157050.measurementapi.com/serve?action=click&publisher_id=157050&site_id=91086\">download Nooch</a> from the App Store - " +
                               "and be sure to use my Referral Code:</p><p style=\"text-align:center;font-size:1.5em;\"><strong>" + $scope.inviteCode + "</strong></p>" +
                               "<p>To learn more about Nooch, here's the website: <a href=\"https://www.nooch.com/overview/\">www.Nooch.com</a>.</p><p>- " + $localStorage.GLOBAL_VARIABLES.firstName + "</p>";
                 var toArr = [""];
                 var ccArr = [""];
                 var bccArr = [""];

                 $ionicPlatform.ready(function () {
                     // toArr, ccArr and bccArr must be an array, file can be either null, string or array
                     $cordovaSocialSharing
                       .shareViaEmail(msgBody, subject, toArr, ccArr, bccArr, null)
                       .then(function (result) {
                           // Success!
                       }, function (err) {
                           CommonServices.DisplayError('Oh no! Unable to send an email right now.');
                       });
                 });
             }
         }
         else
             CommonServices.DisplayError('Oh no! Unable to send a message right now.');
     }

 })
