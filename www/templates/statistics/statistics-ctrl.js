﻿angular.module('noochApp.StatisticsCtrl', ['noochApp.statistics-service', 'noochApp.services', 'zingchart-angularjs'])
/********************/
/***  STATISTICS  ***/
/********************/
.controller('StatisticsCtrl', function ($scope, statisticsService, $ionicLoading, $cordovaNetwork, $ionicContentBanner, $ionicSlideBoxDelegate, CommonServices, $cordovaGoogleAnalytics, $ionicPlatform) {

    $scope.stats = {};

    $scope.export = {};

    $scope.$on("$ionicView.beforeEnter", function (event, data) {
        $scope.GetMemberStatsFn();
    });

    $scope.$on("$ionicView.enter", function (event, data) {
        //console.log('Statistics Cntrlr Loaded');

        $ionicPlatform.ready(function () {
            if (typeof analytics !== 'undefined') analytics.trackView("Statistics");
        })
    })

    $scope.slideOptions = {
        loop: false,
        effect: 'slide',
        speed: 500,
    }

    $scope.gotoSlide1 = function () { $ionicSlideBoxDelegate.slide(0); }

    $scope.gotoSlide2 = function () { $ionicSlideBoxDelegate.slide(1); }

    $scope.gotoSlide3 = function () { $ionicSlideBoxDelegate.slide(2); }

    $scope.slideChanged = function (index) {
        //console.log('slideChanged');

        if (index == 0)
        {
            $(".statsIconContainer button:not(.slide0)").removeClass("selected");
            $(".statsIconContainer .slide0").addClass("selected");
        }
        else if (index == 1)
        {
            $(".statsIconContainer button:not(.slide1)").removeClass("selected");
            $(".statsIconContainer .slide1").addClass("selected");
        }
        else if (index == 2)
        {
            $(".statsIconContainer button:not(.slide2)").removeClass("selected");
            $(".statsIconContainer .slide2").addClass("selected");

            if ($scope.friendList == null || $scope.friendList.length == 0)
                $('#statsEmptyDiv img').addClass('slideInUp');
        }
    };

    $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
        // data.slider is the instance of Swiper
        $scope.slider = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeStart", function (event, data) {
        //console.log('slideChangeStart');
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function (event, data) {
        // note: the indexes are 0-based
    });


    $scope.GetMemberStatsFn = function () {
        //if ($cordovaNetwork.isOnline()) {
        $ionicLoading.show({
            template: 'Gathering Account Stats...'
        });

        statisticsService.GetMemberStatsGeneric()
            .success(function (data) {
                //console.log(data);

                $scope.stats.Largest_sent_transfer = data.Largest_sent_transfer;
                $scope.stats.Total_Sent = data.Total_Sent;
                $scope.stats.Total_Received = data.Total_Received;
                $scope.stats.Largest_received_transfer = data.Largest_received_transfer;
                $scope.stats.Total_no_of_transfer_Received = data.Total_no_of_transfer_Received;
                $scope.stats.Total_no_of_transfer_Sent = data.Total_no_of_transfer_Sent;
                $scope.stats.Total_P2P_transfers = data.Total_P2P_transfers;
                $scope.stats.Total_Friends_Invited = data.Total_Friends_Invited;
                $scope.stats.Total_Friends_Joined = data.Total_Friends_Joined;
                $scope.stats.Total_Posts_To_TW = data.Total_Posts_To_TW;
                $scope.stats.Total_Posts_To_FB = data.Total_Posts_To_FB;

                $ionicLoading.hide();
            })
            .error(function (data) {
                console.log('eror: [' + data + ']');
                $ionicLoading.hide();
                if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
                    CommonServices.logOut();
            });


        statisticsService.GetMostFrequentFriends()
            .success(function (data) {

                $scope.friendList = data;
                //console.log(data);

                var val = [];
                var totalFrequency = 0;

                for (var x = 0; x < data.length; x++)
                {
                    val.push({ "values": [data[x].Frequency] });
                    totalFrequency += data[x].Frequency;
                }

                //console.log(val);

                var myChartData = {
                    "graphset": [{
                        "plot": {
                            "value-box": {
                                "text": "%v",
                                "placement": "in",
                                "slice": "50%"
                            }
                        },
                        "title": {
                            "text": totalFrequency + ' Total Payments'
                        },
                        "type": "ring",
                        "series": val
                    }]
                };

                zingchart.render({
                    id: "topFriendsChart",
                    height: 230,
                    width: 240,
                    data: myChartData
                });
                $('#topFriendsChart-license').addClass('hide');

            })
            .error(function (error) {
                console.log('GetMostFrequentFriends error: [' + JSON.stringify(error) + ']');
                $ionicLoading.hide();
                if (error.ExceptionMessage == 'Invalid OAuth 2 Access')
                    CommonServices.logOut();
            });
    }


    $scope.exportHistory = function () {
        console.log('exportHistoryFn Fired');
        // if ($cordovaNetwork.isOnline()) {
        $ionicLoading.show({
            template: 'Getting account stats...'
        });

        statisticsService.sendTransactionInCSV()
        .success(function (data) {
            $ionicLoading.hide();

            $scope.export.IsSuccess = data;
            console.log('export.IsSuccess -> [' + $scope.export.IsSuccess.Result + ']');

            if ($scope.export.IsSuccess.Result == 1)
                swal("Export Successful", "Please check your email for a .CSV of your account transaction history.", "success");
            else
                swal("Error :-(", "Something went wrong! Please contact us to let us know.", "error");

            console.log($scope.export.IsSuccess.Result);

        }).error(function (data) {
            console.log('eror: [' + data + ']');
            $ionicLoading.hide();

            if (data.ExceptionMessage == 'Invalid OAuth 2 Access')
                CommonServices.logOut();
        });

        //  }
        //else {
        //    swal("Oops...", "Internet not connected!", "error");
        //}
    }

})