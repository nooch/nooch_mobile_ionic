﻿angular.module('noochApp.referAfriendCtrl', ['noochApp.services'])

 .controller('referAfriendCtrl', function ($scope, authenticationService, $ionicPlatform, $cordovaSocialSharing) {

     $scope.$on("$ionicView.enter", function (event, data) {
         console.log("Refer a friend Controller Loaded");
     });

     $ionicPlatform.ready(function () {
         window.plugins.spinnerDialog.show("title", "message", true);
     });

     $scope.sendReferralCode = function (type) {
         console.log(type + " clicked");

         if (type == "sms")
         {
             var msg = "Hey! You should check out Nooch, a great new free app for paying me back. Use my invite code: \"" + $scope.inviteCode + "\" - download here: http://bit.ly/1xdG2le";

             $ionicPlatform.ready(function () {
                 // access multiple numbers in a string like: '0612345678,0687654321'
                 $cordovaSocialSharing
                   .shareViaSMS(message, number)
                   .then(function (result) {
                       // Success!
                   }, function (err) {
                       // An error occurred. Show a message to the user
                   });
             });
         }
         else if (type == "fb")
         {
             var shareTitle = "Check Out Nooch!";
             var shareDesc = "Check out Nooch, the simplest way to pay me back (and get paid by anyone - for free)! Use my invite code to sign up: \"" + $scope.inviteCode + "\"";
             var imageURL = "http://noochme.com/noochweb/Assets/Images/noochlogosquare.png";

             $ionicPlatform.ready(function () {
                 $cordovaSocialSharing
                    .shareViaFacebook(message, image, link)
                    .then(function (result) {
                        // Success!
                    }, function (err) {
                        // An error occurred. Show a message to the user
                    });
             });
         }
         else if (type == "twitter")
         {
             var tweetTxt = "Check out @NoochMoney, the simplest free way to pay me back! Use my invite code to sign up: \"" + $scope.inviteCode + "\"";
             var addUrl = "http://bit.ly/1xdG2le";

             $ionicPlatform.ready(function () {
                 $cordovaSocialSharing
                    .shareViaTwitter(message, image, link)
                    .then(function (result) {
                        // Success!
                    }, function (err) {
                        // An error occurred. Show a message to the user
                    });
             });
         }
         else if (type == "email")
         {
             var emailTitle = "Check out Nooch - a free app to pay me back";
             var msgBody = "Hey there,<br/><p>You should check out Nooch, a great <strong>free app</strong> that lets me pay you back anytime, anywhere.  Since I know you don't like carrying cash around either, I thought you would love using Nooch!</p><p>You can <a href=\"https://157050.measurementapi.com/serve?action=click&publisher_id=157050&site_id=91086\">download Nooch</a> from the App Store - and be sure to use my Referral Code:</p><p style=\"text-align:center;font-size:1.5em;\"><strong>" + $scope.inviteCode + "</strong></p><p>To learn more about Nooch, here's the website: <a href=\"https://www.nooch.com/overview/\">www.Nooch.com</a>.</p><p>- " + $scope.firstName + "</p>";

             $ionicPlatform.ready(function () {
                 // toArr, ccArr and bccArr must be an array, file can be either null, string or array
                 $cordovaSocialSharing
                   .shareViaEmail(message, subject, toArr, ccArr, bccArr, file)
                   .then(function (result) {
                       // Success!
                   }, function (err) {
                       // An error occurred. Show a message to the user
                   });
             });
         }
     }
 })
