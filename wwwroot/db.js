var app = angular.module('PHVApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter, $rootScope, $window, $timeout, $location) {


    $scope.filter_from = null;
    $scope.filter_to = null;

    $scope.load = function () {

        var objs = {
            "SysID": "select * from [dbo].[tb_shop_visit] order by SysID desc;"
        };

        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function (responsea) {
            console.log(responsea.data);
            $scope.reg_lst = responsea.data;
        }, function (responsea) { });

    };

    $scope.load();

    $scope.filterByDate = function () {
        if (!$scope.filter_from && !$scope.filter_to) {
            $scope.load();
            return;
        }

        var fromStr = $scope.filter_from ? $filter('date')($scope.filter_from, 'yyyy/MM/dd') : '2000/01/01';
        var toStr = $scope.filter_to ? $filter('date')($scope.filter_to, 'yyyy/MM/dd') + ' 23:59:59' : '2099/12/31 23:59:59';

        var objs = {
            "SysID": "select * from [dbo].[tb_shop_visit] where created_dt >= '" + fromStr + "' and created_dt <= '" + toStr + "' order by SysID desc;"
        };

        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function (responsea) {
            console.log(responsea.data);
            $scope.reg_lst = responsea.data;
        }, function (responsea) { });
    };

    $scope.clearFilter = function () {
        $scope.filter_from = null;
        $scope.filter_to = null;
        $scope.load();
    };

    $scope.img_url = "";
    $scope.pic_view = function (a, fileName) {
        $scope.pn = a.shop_name;
        $scope.img_url = "./img/" + fileName;
        console.log($scope.img_url);
    };

});
