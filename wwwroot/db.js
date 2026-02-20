var app = angular.module('PHVApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter, $rootScope, $window, $timeout, $location) {


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

    $scope.img_url = "";
    $scope.pic_view = function (a, fileName) {
        $scope.pn = a.shop_name;
        $scope.img_url = "./img/" + fileName;
        console.log($scope.img_url);
    };

});
