﻿angular.module('noochApp.securitySetting-service', ['noochApp.services'])
  .service('MemberPrivacy', function ($http, $localStorage) {


      this.MemberPrivacySettings = function (ChkBox) {


        var reqForMemberSettings = {
          method: 'POST',
          url: URLs.MemberPrivacySettings + '?accessToken=' + $localStorage.GLOBAL_VARIABLES.AccessToken,
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            MemberId: $localStorage.GLOBAL_VARIABLES.MemberId,
            ShowInSearch: ChkBox.ShowInSearch,
            AllowSharing: "false",
            RequireImmediately: ChkBox.RequirePin
          }

        };

         return $http(reqForMemberSettings);
      }


  })