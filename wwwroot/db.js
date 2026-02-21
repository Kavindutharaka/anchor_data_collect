var app = angular.module('PHVApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter, $rootScope, $window, $timeout, $location) {


    $scope.filter_from = null;
    $scope.filter_to = null;
    $scope.filter_code = '';

    // Load saved root codes from localStorage for the filter dropdown
    try {
        $scope.savedCodes = JSON.parse(localStorage.getItem('tb_root_codes') || '[]');
    } catch (e) {
        $scope.savedCodes = [];
    }

    function buildWhereClause() {
        var conditions = [];

        if ($scope.filter_from || $scope.filter_to) {
            var fromStr = $scope.filter_from ? $filter('date')($scope.filter_from, 'yyyy/MM/dd') : '2000/01/01';
            var toStr = $scope.filter_to ? $filter('date')($scope.filter_to, 'yyyy/MM/dd') + ' 23:59:59' : '2099/12/31 23:59:59';
            conditions.push("created_dt >= '" + fromStr + "' and created_dt <= '" + toStr + "'");
        }

        if ($scope.filter_code) {
            conditions.push("root_code = '" + $scope.filter_code + "'");
        }

        return conditions.length > 0 ? ' where ' + conditions.join(' and ') : '';
    }

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

    $scope.filterRecords = function () {
        var where = buildWhereClause();
        var objs = {
            "SysID": "select * from [dbo].[tb_shop_visit]" + where + " order by SysID desc;"
        };

        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function (responsea) {
            console.log(responsea.data);
            $scope.reg_lst = responsea.data;
        }, function (responsea) { });
    };

    // Keep legacy filterByDate alias
    $scope.filterByDate = $scope.filterRecords;

    $scope.clearFilter = function () {
        $scope.filter_from = null;
        $scope.filter_to = null;
        $scope.filter_code = '';
        $scope.load();
    };

    $scope.img_url = "";
    $scope.pic_view = function (a, fileName) {
        $scope.pn = a.shop_name;
        $scope.img_url = "./img/" + fileName;
        console.log($scope.img_url);
    };

});
