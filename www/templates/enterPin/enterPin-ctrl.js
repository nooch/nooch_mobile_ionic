﻿angular.module('noochApp.enterPin', ['noochApp.services', 'noochApp.enterPin-service'])

    .controller('enterPinCtrl', function ($scope, $state, $stateParams, $localStorage, $ionicHistory, $ionicLoading, $cordovaSocialSharing,
										  CommonServices, ValidatePin, transferDetailsService, howMuchService, enterPinService, $cordovaGoogleAnalytics, $ionicPlatform) {

        $scope.$on("$ionicView.beforeEnter", function (event, data) {
            console.log('Enter Pin Controller loaded');
            var obj = CommonServices.getPinValidationScreenData();

            $scope.Details = obj.transObj;
            $scope.Details.enterPin = '';
            $scope.memId = $localStorage.GLOBAL_VARIABLES.MemberId;
            $scope.returnUrl = obj.returnUrl;
            $scope.returnPage = obj.returnPage;
            $scope.type = obj.type;

            $scope.attachedPicForLocalDisplay = null;

            console.log($scope.Details);

            if ($scope.Details.Picture != null)
            {
                console.log('ENTER PIN --> FOUND A PICTURE');
                // CC (9/14/16): The How Much Scrn sends the Base64 version to CommonServices.getPinValidationScreenData()...
                // THAT version is what we display here for the Enter PIN screen...
                // But we strip out the Base64 prefix stuff to send to the server (I think)
                $scope.attachedPicForLocalDisplay = $scope.Details.Picture;
                $scope.Details.Picture = ($scope.Details.Picture.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));
            }

            $ionicPlatform.ready(function () {
                if (typeof analytics !== 'undefined') analytics.trackView("Enter PIN");
            })
        });


        $scope.$on("$ionicView.afterEnter", function (event, data) {
            $("#pin").focus();
        });


        $scope.processPin = function () {
            $scope.Details.Latitude = $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude;
            $scope.Details.Longitude = $localStorage.GLOBAL_VARIABLES.UserCurrentLongi;

            var Pin = $scope.Details.enterPin;
            console.log(Pin);

            if (Pin.length == 4)
            {
                //if ($cordovaNetwork.isOnline()) {
                $ionicLoading.show({
                    template: 'Submitting Payment...'
                });

                console.log(JSON.stringify($scope.Details));

                CommonServices.GetEncryptedData(Pin).success(function (encrPin) {

                    $scope.Details.PinNumber = encrPin.Status;

                    ValidatePin.ValidatePinNumberToEnterForEnterForeground($scope.Details.PinNumber)
	                   .success(function (data) {
	                       console.log(data);

	                       if (data.Result == 'Success')
	                       {
	                           if ($scope.returnUrl == 'app.home')
	                               $ionicHistory.clearCache().then(function () { $state.go($scope.returnUrl); });

	                           if ($scope.type == 'transfer')
	                           {
	                               if ($scope.Details.MemberId != $scope.Details.RecepientId &&
									   $scope.Details.RecepientId != null &&
									   $scope.Details.RecepientId != undefined)
	                               {
	                                   enterPinService.TransferMoney($scope.Details)
										   .success(function (data) {

										       if (data.Result == 'Your cash was sent successfully')
										           $scope.showSuccessAlert('send');
										       else
										           $scope.showErrorAlert(data.Result);
										   })
										   .error(function (error) {
										       console.log("TransferMoney Error: [" + JSON.strigify(error) + "]");
										       $ionicLoading.hide();
										       swal("Error", error, "error");
										   });
	                               }
	                               else if (($scope.Details.MemberId == $scope.Details.RecepientId ||
									   		 $scope.Details.RecepientId == null ||
									   		 $scope.Details.RecepientId == undefined) &&
									   		 $scope.Details.InvitationSentTo != undefined)
	                               {
	                                   enterPinService.TransferMoneyToNonNoochUserUsingSynapse($scope.Details)
	                                    .success(function (data) {

	                                        if (data.Result == 'Your cash was sent successfully')
	                                            $scope.showSuccessAlert('send');
	                                        else
	                                            $scope.showErrorAlert(data.Result);
	                                    })
	                                    .error(function (error) {
	                                        console.log("TransferMoneyToNonNoochUserUsingSynapse Error: [" + JSON.strigify(error) + "]");
	                                        $ionicLoading.hide();
	                                        swal("Error", error, "error");
	                                    });
	                               }
	                               else if (($scope.Details.MemberId == $scope.Details.RecepientId ||
									   		 $scope.Details.RecepientId == null ||
									   		 $scope.Details.RecepientId == undefined) &&
									   		 $scope.Details.PhoneNumberInvited != undefined)
	                               {
	                                   enterPinService.TransferMoneyToNonNoochUserThroughPhoneUsingsynapse($scope.Details)
                                           .success(function (data) {

                                               if (data.Result == 'Your cash was sent successfully')
                                                   $scope.showSuccessAlert('send');
                                               else
                                                   $scope.showErrorAlert(data.Result);
                                           })
                                           .error(function (error) {
                                               console.log("TransferMoneyToNonNoochUserThroughPhoneUsingsynapse Error: [" + JSON.strigify(error) + "]");
                                               $ionicLoading.hide();
                                               swal("Error", error, "error");
                                           });
	                               }
	                           }

	                           else if ($scope.type == 'request')
	                           {
	                               if ($scope.Details.SenderId != null)
	                               {
	                                   console.log($scope.Details);

	                                   enterPinService.RequestMoney($scope.Details)
                                           .success(function (data) {

                                               if (data.Result.indexOf('successfully') > -1)
                                                   $scope.showSuccessAlert('request');
                                               else
                                                   $scope.showErrorAlert(data.Result);
                                           })
                                           .error(function (error) {
                                               console.log("RequestMoney Error: [" + JSON.strigify(error) + "]");
                                               $ionicLoading.hide();
                                               swal("Error", error, "error");

                                               if (error.ExceptionMessage == 'Invalid OAuth 2 Access')
                                                   CommonServices.logOut();
                                           });
	                               }
	                               else if (($scope.Details.SenderId == null || $scope.Details.SenderId == undefined) &&
								   			 $scope.Details.MoneySenderEmailId != null &&
								   			 $scope.Details.ContactNumber == null)
	                               {
	                                   enterPinService.RequestMoneyToNonNoochUserUsingSynapse($scope.Details)
                                           .success(function (data) {

                                               if (data.Result.indexOf('successfully') > -1)
                                                   $scope.showSuccessAlert('request');
                                               else
                                                   $scope.showErrorAlert(data.Result);
                                           })
                                           .error(function (data) {
                                               console.log("RequestMoneyToNonNoochUserUsingSynapse Error: [" + JSON.strigify(error) + "]");
                                               $ionicLoading.hide();
                                               swal("Error", error, "error");

                                               if (error.ExceptionMessage == 'Invalid OAuth 2 Access')
                                                   CommonServices.logOut();
                                           });
	                               }
	                               else if ($scope.Details.SenderId == null && $scope.Details.contactNumber != null)
	                               {
	                                   enterPinService.RequestMoneyToNonNoochUserThroughPhoneUsingSynapse($scope.Details, $scope.Details.contactNumber)
                                           .success(function (data) {

                                               if (data.Result.indexOf('successfully') > -1)
                                                   $scope.showSuccessAlert('request');
                                               else
                                                   $scope.showErrorAlert(data.Result);
                                           })
                                           .error(function (error) {
                                               console.log("RequestMoneyToNonNoochUserThroughPhoneUsingSynapse Error: [" + JSON.strigify(error) + "]");
                                               $ionicLoading.hide();
                                               swal("Error", error, "error");

                                               if (error.ExceptionMessage == 'Invalid OAuth 2 Access')
                                                   CommonServices.logOut();
                                           });
	                               }
	                           }
	                       }
	                       else if (data.Result == 'Invalid Pin')
	                       {
	                           $ionicLoading.hide();
	                           swal({
	                               title: "Incorrect PIN",
	                               text: "Looks like your PIN wasn't quite right! Please try again.",
	                               type: "error",
	                               customClass: "singleBtn",
	                           }, function () {
	                               $scope.Details.enterPin = '';
	                               $("#pin").val('').focus();
	                           });
	                       }
	                       else// if (data.Message == 'An error has occurred.')
	                       {
	                           $ionicLoading.hide();
	                           $scope.showErrorAlert('');
	                       }
	                   })
					   .error(function (error) {
					       console.log('Enter PIN -> ValidatePinNumberToEnterForEnterForeground Error [' + JSON.strigify(error) + ']');
					       $ionicLoading.hide();

					       if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
					           CommonServices.logOut();
					   });
                })
				.error(function (error) {
				    $ionicLoading.hide();

				    if (error.ExceptionMessage == 'Invalid OAuth 2 Access')
				        CommonServices.logOut();
				});
                //}
                //else
                //    swal("Error", "Internet not connected!", "error");
            }
        }


        $scope.showSuccessAlert = function (type) {
            $ionicLoading.hide();

            $scope.Details.Amount = "";
            $scope.Details.Memo = "";
            $scope.Details = "";

            var title = "";
            var msg = "";

            if (type == 'request')
            {
                title = "Request Sent";
                msg = "Your payment request has been sent succesfully.";
            }
            else
            {
                title = "Payment Sent";
                msg = "Your payment has been sent successfully.";
            }

            swal({
                title: title,
                text: msg,
                type: "success",
                showCancelButton: true,
                confirmButtonText: "View Details",
                cancelButtonText: "Ok",
            }, function (isConfirm) {
                $scope.Details = '';

                if (isConfirm)
                    $state.go('app.transferDetails');
                else if ($scope.returnUrl == 'app.transferDetails')
                    $ionicHistory.clearCache().then(function () {
                        $state.go('app.history');
                    });
                else
                    $ionicHistory.clearCache().then(function () {
                        $state.go('app.home');
                    });
            });
        }


        $scope.showErrorAlert = function (msg) {
            $ionicLoading.hide();

            swal("Error", msg, "error");

            swal({
                title: "Error :-()",
                text: "Your account has been temporarily suspended because you entered an incorrect passwod too many times." +
					  "<span class='show'>In most cases your account will be automatically un-suspended in 24 hours.</span>" +
					  "<span class='show'>We really apologize for the inconvenience and ask for your patience. Our top priority is keeping Nooch safe and secure.</span>",
                type: "error",
                showCancelButton: true,
                cancelButtonText: "Ok",
                confirmButtonText: "Contact Support",
                html: true
            }, function (isConfirm) {
                if (isConfirm)
                {
                    $cordovaSocialSharing
                      .shareViaEmail('', 'Nooch Support Request - Account Suspended', 'support@nooch.com', null, null, null)
                      .then(function (res) {
                          $state.go('app.home');
                      }, function (err) {
                          console.log('Error attempting to send email from social sharing: [' + JSON.stringify(err) + ']');
                          $state.go('app.home');
                      });
                }
            });
        }


        $scope.GoBack = function () {
            if ($scope.returnUrl == 'app.howMuch')
            {
                console.log($scope.Details);

                // handle case when request is made to email address typed
                if (($scope.Details.SenderId == null || $scope.Details.SenderId == undefined) &&
					 $scope.Details.MoneySenderEmailId != null &&
					 $scope.Details.ContactNumber == null)
                    $state.go($scope.returnUrl, { recip: $scope.Details.MoneySenderEmailId });
                else if ($scope.Details.SenderId == null && $scope.Details.contactNumber != null)
                    $state.go($scope.returnUrl, { recip: $scope.Details.contactNumber });
                else
                    $state.go($scope.returnUrl, { recip: $scope.Details });
            }

            if ($scope.returnUrl == 'app.transferDetails')
                $state.go($scope.returnUrl, { trans: $scope.Details });

            $stateParams = '';
            $scope.Details = '';

            console.log("Enter PIN -> GoBack() -> Getting Here??");

            $ionicHistory.clearCache().then(function () { $state.go($scope.returnUrl); });
        };

    });
