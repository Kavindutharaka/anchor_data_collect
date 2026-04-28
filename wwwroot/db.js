var app = angular.module('PHVApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter) {

    $scope.filter_from = null;
    $scope.filter_to   = null;
    $scope.filter_outlet = '';

    // Load outlet codes for filter dropdown
    $scope.outlets = [];
    (function () {
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; SELECT outlet_code, shop_name, town FROM [dbo].[tb_outlets] ORDER BY outlet_code ASC"
        })).then(function (res) { $scope.outlets = res.data; });
    })();

    var baseQuery = "USE [phvtechc_tb]; SELECT v.*, o.shop_name, o.town, o.owner_contact FROM [dbo].[tb_shop_visit] v LEFT JOIN [dbo].[tb_outlets] o ON v.outlet_code = o.outlet_code";

    function buildWhere() {
        var conditions = [];
        if ($scope.filter_from || $scope.filter_to) {
            var from = $scope.filter_from ? $filter('date')($scope.filter_from, 'yyyy/MM/dd') : '2000/01/01';
            var to   = $scope.filter_to   ? $filter('date')($scope.filter_to,   'yyyy/MM/dd') + ' 23:59:59' : '2099/12/31 23:59:59';
            conditions.push("v.created_dt >= '" + from + "' AND v.created_dt <= '" + to + "'");
        }
        if ($scope.filter_outlet) {
            conditions.push("v.outlet_code = '" + $scope.filter_outlet + "'");
        }
        return conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    }

    $scope.load = function () {
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": baseQuery + " ORDER BY v.SysID DESC"
        })).then(function (res) { $scope.reg_lst = res.data; });
    };

    $scope.load();

    $scope.filterRecords = function () {
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": baseQuery + buildWhere() + " ORDER BY v.SysID DESC"
        })).then(function (res) { $scope.reg_lst = res.data; });
    };

    $scope.clearFilter = function () {
        $scope.filter_from   = null;
        $scope.filter_to     = null;
        $scope.filter_outlet = '';
        $scope.load();
    };

    $scope.img_url = "";
    $scope.pn = "";
    $scope.pic_view = function (label, fileName) {
        $scope.pn      = label;
        $scope.img_url = "./img/" + fileName;
    };

});
