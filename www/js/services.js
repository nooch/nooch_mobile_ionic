angular.module('noochApp.services', ['ngStorage'])


// Adding some common usefull services in here like enc, dec etc.
  .service('CommonServices', function ($http, $localStorage, $state, $window, $ionicLoading) {
      this.GetEncryptedData = function (dataToEncrypt) {
          return $http.get(URLs.GetEncryptedData + '?data=' + btoa(dataToEncrypt));   // btoa DOES THE BASE 64 ENCRYPTION FOR GIVEN INPUT
      }

      this.GetDecryptedData = function (dataToDecrypt) {
		  var url = URLs.GetDecryptedData + '?sourceData=' + dataToDecrypt;
		  console.log(url);
          return $http.get(url);
      }

      this.GetMemberIdByUsername = function (userName) {
          return $http.get(URLs.GetMemberIdByUsername + '?userName=' + userName);
      }

      this.GetMemberIdByPhone = function (userPhone) {
          return $http.get(URLs.GetMemberIdByPhone + '?phoneNo=' + userPhone + '&accessToken=' + $localStorage.GLOBAL_VARIABLES.AccessToken);
      }

      this.GetMemberDetails = function (memberId) {
          return $http.get(URLs.GetMemberDetails + '?memberId=' + memberId + '&accessToken=' + $localStorage.GLOBAL_VARIABLES.AccessToken);
      }

      this.logOut = function () {
          //$ionicLoading.show({
          //    template: 'Logging out...'
          //});

          $localStorage.GLOBAL_VARIABLES.IsDemoDone = false;
          $localStorage.GLOBAL_VARIABLES.IsUserLocationSharedWithNooch = false;
          $localStorage.GLOBAL_VARIABLES.IsNotificationPermissionGiven = false;

          $localStorage.GLOBAL_VARIABLES.IsPhoneVerified = false;
          $localStorage.GLOBAL_VARIABLES.hasSynapseUserAccount = false;
          $localStorage.GLOBAL_VARIABLES.isBankVerified = false;
          $localStorage.GLOBAL_VARIABLES.isProfileComplete = false;

          $localStorage.GLOBAL_VARIABLES.UserCurrentLatitude = "0";
          $localStorage.GLOBAL_VARIABLES.UserCurrentLongi = "0";
          $localStorage.GLOBAL_VARIABLES.MemberId = '';
          if ($localStorage.GLOBAL_VARIABLES.IsRemeberMeEnabled == false)
              $localStorage.GLOBAL_VARIABLES.UserName = '';
          $localStorage.GLOBAL_VARIABLES.AccessToken = '';
          //$localStorage.GLOBAL_VARIABLES.DeviceId = '';
          $localStorage.GLOBAL_VARIABLES.DeviceToken = '';
          $localStorage.GLOBAL_VARIABLES.DeviceOS = '';
          $localStorage.GLOBAL_VARIABLES.PhotoUrl =
          $localStorage.GLOBAL_VARIABLES.Status = '';
          $localStorage.GLOBAL_VARIABLES.synBankAllowed = '';
          $localStorage.GLOBAL_VARIABLES.synUserPermission = '';

          console.log($localStorage.GLOBAL_VARIABLES);

          $state.go('login');
      }

      this.IsDuplicateMember = function (userName) {
          return $http.get(URLs.IsDuplicateMember + '?userName=' + userName);
      }

      this.ValidatePinNumberToEnterForEnterForeground = function (pinNumber) {
          return $http.get(URLs.ValidatePinNumberToEnterForEnterForeground + '?memberId=' + $localStorage.GLOBAL_VARIABLES.MemberId + '&pinNo=' + pinNumber + '&accessToken=' + $localStorage.GLOBAL_VARIABLES.AccessToken);
      }

      this.ValidatePinNumber = function (pinNumber) {
          return $http.get(URLs.ValidatePinNumber + '?memberId=' + $localStorage.GLOBAL_VARIABLES.MemberId + '&pinNo=' + pinNumber + '&accessToken=' + $localStorage.GLOBAL_VARIABLES.AccessToken);
      }

      this.GetMemberDetails = function () {
          return $http.get(URLs.GetMemberDetails + '?memberId=' + $localStorage.GLOBAL_VARIABLES.MemberId + '&accessToken=' + $localStorage.GLOBAL_VARIABLES.AccessToken);
      }

      this.savePinValidationScreenData = function (data) {
          console.log(data);
          $localStorage.GLOBAL_VARIABLES.pinValidatorData = data;
      }

      this.getPinValidationScreenData = function () {
          return $localStorage.GLOBAL_VARIABLES.pinValidatorData;
      }

      this.getScreenWidth = function () {
          return $window.innerWidth;
      }

      this.getScreenHeight = function () {
          return $window.innerHeight;
      }
  })


  .factory('CommonHelper', function ($localStorage) {
      // reading local settings of user
      return {
          getValueOfGiveKeyFromLocalSettings: function (keyName) {
              if ($localStorage.GLOBAL_VARIABLES.length > 0)
                  return _.get(_.find($localStorage.GLOBAL_VARIABLES, keyName), keyName);
              else return undefined;

          },
          setValueOfGiveKeyFromLocalSettings: function (keyName, valueToSet) {
              return _.set($localStorage.GLOBAL_VARIABLES, keyName, valueToSet);
          }
      }
  })

  .factory('Chats', function () {
      // Might use a resource here that returns a JSON array

      // Some fake testing data
      var chats = [{
          id: 0,
          name: 'Ben Sparrow',
          lastText: 'You on your way?',
          face: 'img/ben.png'
      }, {
          id: 1,
          name: 'Max Lynx',
          lastText: 'Hey, it\'s me',
          face: 'img/max.png'
      }, {
          id: 2,
          name: 'Adam Bradleyson',
          lastText: 'I should buy a boat',
          face: 'img/adam.jpg'
      }, {
          id: 3,
          name: 'Perry Governor',
          lastText: 'Look at my mukluks!',
          face: 'img/perry.png'
      }, {
          id: 4,
          name: 'Mike Harrington',
          lastText: 'This is wicked good ice cream.',
          face: 'img/mike.png'
      }];

      return {
          all: function () {
              return chats;
          },
          remove: function (chat) {
              chats.splice(chats.indexOf(chat), 1);
          },
          get: function (chatId) {
              for (var i = 0; i < chats.length; i++)
              {
                  if (chats[i].id === parseInt(chatId))
                  {
                      return chats[i];
                  }
              }
              return null;
          }
      };
  });
