﻿angular.module('noochApp.LoginCtrl', ['noochApp.login-service', 'noochApp.services', 'ngStorage'])

  .controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicPlatform, $ionicLoading, $localStorage, $cordovaGeolocation, $cordovaDevice,
	  								 $cordovaNetwork, $cordovaSocialSharing, $timeout, CommonHelper, authenticationService, CommonServices) {

      $scope.$on("$ionicView.enter", function (event, data) {
          console.log('Login Controller Loaded');

          $scope.loginData = {
              email: '',
              pwd: '',//Q123456789',
              rmmbrMe: {
                  chk: true
              }
          };

          if ($localStorage.GLOBAL_VARIABLES)
          {
              if ($localStorage.GLOBAL_VARIABLES.MemberId && $localStorage.GLOBAL_VARIABLES.MemberId.length > 0)
              {
                  $state.go('app.home');
              }
              else
              {
                  $scope.loginData.rmmbrMe.chk = $localStorage.GLOBAL_VARIABLES.IsRemeberMeEnabled == false ? false : true;
                  $scope.loginData.email = $localStorage.GLOBAL_VARIABLES.UserName;
              }
          }

          console.log($scope.loginData);
          console.log($localStorage.GLOBAL_VARIABLES);
      });


      $scope.loginWithFbData = {
          Name: '',
          Email: '',
          Password: '',
          Photo: '',
          Pin: '',
          rmmbrMe: {
              chk: $rootScope.isRequiredImmediately == false ? false : true
          },
          FBId: '',
          fbStatus: ''
      };

      $scope.SignIn = function () {

          //if ($cordovaNetwork.isOnline())
          //{
          if ($('#frmLogin').parsley().validate() == true)
          {
              $ionicPlatform.ready(function () {
                  $ionicLoading.show({
                      template: 'Logging in...'
                  });

                  if (window.cordova)
                  {
                      cordova.plugins.diagnostic.isLocationAuthorized(function (enabled) {
                          if (enabled == true)
                          {
                              $localStorage.GLOBAL_VARIABLES.IsUserLocationSharedWithNooch = true;
                              $scope.checkGpsStatus();
                          }
                          else
                          {
                              // User has not yet authorized location access - so just login (we request permission later only at a relevant time, i.e. on Select Recipient -> Search By Location Tab)
                              $localStorage.GLOBAL_VARIABLES.IsUserLocationSharedWithNooch = false;
                              $localStorage.GLOBAL_VARIABLES.UserCurrentLongi = '0.00';
                              $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude = '0.00';

                              $scope.loginService();
                          }
                      }, function (error) {
                          $localStorage.GLOBAL_VARIABLES.IsUserLocationSharedWithNooch = false;
                          console.log($localStorage.GLOBAL_VARIABLES.IsUserLocationSharedWithNooch);
                          console.error("The following error occurred: " + error);
                      });
                  }
                  else // for Browser testing
                      $scope.loginService();
              });
          }
          //} else
          //    swal("Oops...", "Internet not connected!", "error");
      }


      $scope.loginService = function () {
          CommonServices.GetEncryptedData($scope.loginData.pwd).success(function (data) {

              console.log($localStorage.GLOBAL_VARIABLES);

              authenticationService.Login($scope.loginData.email, data.Status, $scope.loginData.rmmbrMe.chk, $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude,
                $localStorage.GLOBAL_VARIABLES.UserCurrentLongi, $localStorage.GLOBAL_VARIABLES.DeviceId, $localStorage.GLOBAL_VARIABLES.DeviceToken, $localStorage.GLOBAL_VARIABLES.DeviceOS)
                .success(function (response) {

                    $localStorage.GLOBAL_VARIABLES.UserName = $scope.loginData.email;
					$rootScope.isRequiredImmediately = $scope.loginData.rmmbrMe.chk;

                    console.log(response);

                    $ionicLoading.hide();

                    if (response.Result.indexOf('Invalid user id') > -1)
                    {
                        $ionicLoading.hide();
                        swal("Invalid Email or Password", "We don't recognize that information. Please double check check your email is entered correctly and try again.", "error");
                    }
                    else if (response.Result.indexOf('incorrect') > -1)
                    {
                        $ionicLoading.hide();
                        swal("This is Awkward", "That doesn't appear to be the correct password. Please try again or contact us for further help.");
                    }
                    else if (response.Result.indexOf('Temporarily_Blocked') > -1 || response.Result.indexOf('Suspended') > -1)
                    {
                        $ionicLoading.hide();
                        swal({
                            title: "Account Suspended",
                            text: "Your account has been temporarily suspended because you entered an incorrect passwod too many times." +
								  "<span class='show'>In most cases your account will be automatically un-suspended in 24 hours.</span>" +
								  "<span class='show'>We really apologize for the inconvenience and ask for your patience. Our top priority is keeping Nooch safe and secure.</span>",
                            type: "error",
                            showCancelButton: true,
                            cancelButtonText: "Ok",
                            confirmButtonColor: "#3fabe1",
                            confirmButtonText: "Contact Support",
                            html: true
                        }, function (isConfirm) {
                            if (isConfirm)
                            {
                                // toArr, ccArr and bccArr must be an array, file can be either null, string or array
                                //.shareViaEmail(message, subject, toArr, ccArr, bccArr, file) --Params
                                $cordovaSocialSharing
                                  .shareViaEmail('', 'Nooch Support Request - Account Suspended', 'support@nooch.com', null, null, null)
                                  .then(function (result) {
                                      swal("Message Sent", "Your email has been sent - we will get back to you soon!", "success");
                                  }, function (err) {
                                      // An error occurred. Show a message to the user
                                      console.log('Error attempting to send email from social sharing: [' + err + ']');
                                  });
                            }
                        });
                    }
                    else
                    {
                        $localStorage.GLOBAL_VARIABLES.UserName = $scope.loginData.email;
                        $localStorage.GLOBAL_VARIABLES.AccessToken = response.Result;
                        $localStorage.GLOBAL_VARIABLES.Pwd = data.Status;

                        $scope.fetchAfterLoginDetails();
                        //if ($localStorage.GLOBAL_VARIABLES.MemberId != null)
                        //$state.go('app.home');
                    }
                })
				.error(function (res) {
                    $ionicLoading.hide();
                    console.log('Login Attempt Error: [' + JSON.stringify(res) + ']');

                    swal({
                        title: "Oh no",
                        text: "Terribly sorry, but we're having trouble logging you in! Please try again or contact us for futher help.",
                        type: "error",
                        showCancelButton: true,
                        cancelButtonText: "Ok",
                        confirmButtonColor: "#3fabe1",
                        confirmButtonText: "Contact Support",
                        customClass: "stackedBtns"
                    }, function (isConfirm) {
                        if (isConfirm)
                        {
                            // toArr, ccArr and bccArr must be an array, file can be either null, string or array
                            //.shareViaEmail(message, subject, toArr, ccArr, bccArr, file) --Params
                            $cordovaSocialSharing
                              .shareViaEmail('', 'Nooch Support Request - Login Trouble', 'support@nooch.com', null, null, null)
                              .then(function (result) {
                                  swal("Message Sent", "Your email has been sent - we will get back to you soon!", "success");
                              }, function (err) {
                                  console.log('Error attempting to send email from social sharing: [' + err + ']');
                              });
                        }
                    });
                });
          })
		  .error(function (encError) {
              $ionicLoading.hide();
              console.log('GetEncryptedData Error: [' + encError + ']');
          });
      }


      $scope.forgotPw = function (type) {
          var msgTxt = type == 1 ? "Please enter your email and we will send you a reset link." : "Please make sure you entered a valid email address.";
          swal({
              title: "Forgot Password",
              text: msgTxt,
              type: "input",
              inputPlaceholder: "Email Address",
              showCancelButton: true,
              cancelButtonText: "Cancel",
              confirmButtonColor: "#3fabe1",
              confirmButtonText: "Submit",
              closeOnConfirm: false,
              html: true,
          }, function (inputValue) {
              if (inputValue === false) return false;

              if (inputValue === "" || inputValue.length == 0)
              {
                  swal.showInputError("Please enter the email address associated with your account.");
                  return false
              }

              if (inputValue.indexOf('@') > 1 &&
                  inputValue.indexOf('.') > inputValue.indexOf('@') &&
                  inputValue.indexOf('.') < inputValue.length - 2)
              {
                  authenticationService.ForgotPassword(inputValue).success(function (data) {
                      console.log(data);

                      if (data.success == true)
                          swal("Reset Link Sent", "If that email is associated with a Nooch account, you will receive an email with a link to reset your password.", "success");
                      else
                          swal("Error", data.msg, "error");
                  }).error(function (encError) {
                      console.log('Forgot PW -> Error block ' + encError);
                  });
              }
              else
                  $scope.forgotPw(2)
          });
      }


      $scope.getLocation = function () {
          $cordovaGeolocation
                .getCurrentPosition()
                .then(function (position) {
                    var lat = position.coords.latitude
                    var long = position.coords.longitude

                    $localStorage.GLOBAL_VARIABLES.UserCurrentLongi = position.coords.latitude
                    $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude = position.coords.longitude

                    console.log('$cordovaGeolocation success -> Lat/Long: [' + lat + ', ' + long + ']');

                    $scope.loginService();
                }, function (err) {
                    console.log('$cordovaGeolocation error: [' + JSON.stringify(err) + ']');

                    // Static Loaction in case user denied
                    $localStorage.GLOBAL_VARIABLES.UserCurrentLongi = '31.33';
                    $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude = '54.33';

                    $scope.loginService();
                });
      }


      $scope.checkGpsStatus = function () {
          $ionicPlatform.ready(function () {
              if (window.cordova)
              {
                  cordova.plugins.diagnostic.isLocationEnabled(function (Location) {
                      if (Location == true)
                      {
                          console.log('GPS IS ON - CALLING GET LOACTION');
                          $scope.getLocation();
                      }
                      else
                      {
                          // User has not yet authorized location access - so just login (we request permission later only at a relevant time, i.e. on Select Recipient -> Search By Location Tab)
                          $localStorage.GLOBAL_VARIABLES.IsUserLocationSharedWithNooch = false;
                          $localStorage.GLOBAL_VARIABLES.UserCurrentLongi = '0.00';
                          $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude = '0.00';

                          $scope.loginService();

                          /*swal({
                              title: "GPS Off",
                              text: "Your Location is not shared with Nooch Would you like to share it",
                              type: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#DD6B55",
                              confirmButtonText: "Yes, Enable",
                              closeOnConfirm: true
                          }, function () {
                              if (window.cordova) {
                                  cordova.plugins.diagnostic.switchToLocationSettings();
                                  $timeout($scope.getLocation, 4000); //calling this service after 4s b/c user will take some time to on the GPS :Surya
                              }
                          });*/
                      }
                  }, function (error) {
                      alert("The following error occurred: " + error);
                  });
              }
              else // For Browser Testing
                  $scope.loginService();
          });
      }


      $scope.loginWithFB = function () {
          console.log('LoginWithFB Fired');

          if (!window.cordova)
              facebookConnectPlugin.browserInit("198279616971457");

          facebookConnectPlugin.login(['email', 'public_profile'], function (response) {
              console.log('login response from fb ' + JSON.stringify(response));
              $scope.loginWithFbData.fbStatus = _.get(response, 'status');
              console.log('Face book Status--> ' + $scope.loginWithFbData.fbStatus);

              facebookConnectPlugin.api("/me?fields=name,email,picture.type(large)", ['email'], function (success) {
                  // success
                  console.log('got this from fb ' + JSON.stringify(success));
                  $scope.loginWithFbData.Email = _.get(success, 'email');
                  $scope.loginWithFbData.Name = _.get(success, 'name');
                  $scope.loginWithFbData.Photo = _.get(success, 'picture.data.url');
                  $scope.loginWithFbData.FBId = _.get(success, 'id');

                  if ($scope.loginWithFbData.fbStatus == 'connected')
                      $scope.fbStatus = 'YES';
                  //$scope.em = _.get(success, 'email');
                  //$scope.na = _.get(success, 'name');
                  // $scope.$apply();
                  $localStorage.GLOBAL_VARIABLES.UserName = $scope.loginWithFbData.Email;
                  console.log('Printing from local Storage-->>' + $localStorage.GLOBAL_VARIABLES.UserName);
                  console.log('Here is my  scope object' + JSON.stringify($scope.loginWithFbData));
                  $ionicLoading.show({
                      template: 'Loading...'
                  });

                  authenticationService.LoginWithFacebookGeneric($localStorage.GLOBAL_VARIABLES.UserName, $scope.loginWithFbData.FBId, $scope.loginWithFbData.rmmbrMe.chk, $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude, $localStorage.GLOBAL_VARIABLES.UserCurrentLongi, $localStorage.GLOBAL_VARIABLES.DeviceId, $localStorage.GLOBAL_VARIABLES.DeviceToken)
                        .success(function (response) {
                            console.log(response);

                            //  $localStorage.GLOBAL_VARIABLES.UserName = $scope.loginData.email;
                            $localStorage.GLOBAL_VARIABLES.AccessToken = response.Result;

                            $ionicLoading.hide();
                            $scope.fetchAfterLoginDetails();

                            authenticationService.SaveMembersFBId($localStorage.GLOBAL_VARIABLES.MemberId, $scope.loginWithFbData.FBId, $scope.fbStatus)
                                .success(function (response) {
                                    $ionicLoading.hide();
                                    $state.go('app.home');
                                }).error(function (response) {
                                    console.log('saveMemberFBId Error: [' + response + ']');
                                })

                        }).error(function (res) {
                            $ionicLoading.hide();
                            console.log('Login Attempt Error: [' + JSON.stringify(res) + ']');
                        })
              }, function (error) {
                  // error
                  console.log(error);
              })
          },
          function (response) {
              console.log('error res');
              $ionicLoading.hide();
              //alert(JSON.stringify(response))
          });
      }


      $scope.fetchAfterLoginDetails = function () {
          $ionicLoading.show({
              template: 'Signing in...'
          });

          CommonServices.GetMemberIdByUsername($localStorage.GLOBAL_VARIABLES.UserName).success(function (data) {
              $ionicLoading.hide();

              if (data != null)
              {
                  $localStorage.GLOBAL_VARIABLES.MemberId = data.Result;

                  //console.log($localStorage.GLOBAL_VARIABLES);

                  $state.go('app.home');
              }
          }).error(function (err) {
              $ionicLoading.hide();
          });
      }


      $scope.keyEntered = function () {

          var em = $scope.loginData.email;
          var pw = $scope.loginData.pwd;

          if (em.length > 4 && em.indexOf('@') > 0 && em.indexOf('.') && pw.length > 3)
			  $('#loginBtn').attr('disabled', false);
          else
			  $('#loginBtn').attr('disabled', true);
      }
  })
