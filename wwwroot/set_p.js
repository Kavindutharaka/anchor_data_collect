var app = angular.module('APSApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter, $rootScope, $window, $timeout) {
    $rootScope.phvError = false;
    $scope.phvErrorcolsel = "0";
    $scope.phvToste = function (val1, val2) {
        $scope.phvErrorTital = val1;
        $scope.phvErrorData = val2;
        $rootScope.phvError = true;
        $timeout(function () { $rootScope.phvError = false; $scope.phvErrorcolsel = "0"; }, 2500);
    }


    var host_url = "http://fanta.phvtech.com"; // "."





    $scope.events_call = function () {
        var objs = {
            "SysID": "1", "e": "1", "g": "1", "dt": "2024-06-11 22:10:10", "g1": "10", "g2": "11", "g3": "12", "g4": "13", "lo": "Kandy",
            "nm": "phv", "tp": "0771834688", "g_t": "59", "spd": "11", "g1_t": "41", "rg_t": "31", "fil_lev": "13"
        };

        
        $http.post('./api/Mater/load_setting', JSON.stringify(objs)).then(function (responsea) {

            $scope.settings = responsea.data;
            console.log($scope.settings);
            $scope.db_gt = $scope.settings[0].g_t;
            $scope.db_g1_t = $scope.settings[0].g1_t;
            $scope.rg_t = $scope.settings[0].rg_t;
            $scope.sped = $scope.settings[0].spd;
            $scope.fill_size_db = $scope.settings[0].rg;
           
        }, function (responsea) { });
        $http.post('./api/Mater/gift_list', JSON.stringify(objs)).then(function (responsea) {

            $scope.settings = responsea.data;
            console.log($scope.settings);
            $scope.t = $scope.settings[0].v;
            $scope.cap = $scope.settings[1].v;
            $scope.bag = $scope.settings[2].v;
            $scope.key_t = $scope.settings[3].v;

        }, function (responsea) { });

        
    };
    $scope.events_call();


    $scope.events_gift_add = function () {
        var objsa = {
            "SysID": "1", "e": "1", "g": "1", "dt": "2024-06-11 22:10:10", "g1": $scope.t, "g2": $scope.cap, "g3": $scope.bag
            , "g4": $scope.key_t, "lo": "Kandy",
            "nm": "phv", "tp": "0771834688", "g_t": "59", "spd": "11", "g1_t": "41", "rg_t": "31", "fil_lev": "13"              
        };
        console.log(objsa);
        $http.post('./api/Mater/gift_update', JSON.stringify(objsa)).then(function (responsea) {

            alert("Done");
        }, function (responsea) { console.log("dasd"); });
    };

    $scope.gift_c_up = function () {
        var objs = {
            "SysID": "1", "e": "1", "g": "1", "dt": "2024-06-11 22:10:10", "g1": $scope.t, "g2": $scope.cap, "g3": $scope.bag
            , "g4": $scope.key_t, "lo": "Kandy", "nm": "phv", "tp": "0771834688", "g_t": $scope.db_gt, "spd": $scope.sped,
            "g1_t": $scope.db_g1_t, "rg_t": $scope.rg_t, "fil_lev": $scope.fill_size_db    
             
        };
        $http.post('./api/Mater/setting_up', JSON.stringify(objs)).then(function (responsea) {
            alert("Done !");
        }, function (responsea) { });
    };
    $scope.dt = new Date();
    $scope.report_01 = function () {
        var objs = {
            "SysID": "1", "e": "1", "g": "1", "dt": $filter('date')($scope.dt, 'yyyy-MM-dd'), "g1": $scope.t, "g2": $scope.cap, "g3": $scope.bag
            , "g4": $scope.key_t, "lo": "Kandy", "nm": "phv", "tp": "0771834688", "g_t": $scope.db_gt, "spd": $scope.sped,
            "g1_t": $scope.db_g1_t, "rg_t": $scope.rg_t, "fil_lev": $scope.fill_size_db    
         
        };
        $http.post('./api/Mater/report_01', JSON.stringify(objs)).then(function (responsea) {
            $scope.report1 = responsea.data;
            console.log($scope.report1);
        }, function (responsea) { });
    };


    
});

 
 