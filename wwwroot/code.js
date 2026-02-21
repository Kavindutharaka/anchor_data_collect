var app = angular.module('CodeApp', []);
app.controller('CodeCtrl', function ($scope, $http) {

    $scope.codes = [];
    $scope.newCode = '';
    $scope.newDesc = '';
    $scope.errorMsg = '';
    $scope.loading = false;
    $scope.saving = false;

    // ============ LOAD CODES FROM DB ============
    function loadFromDB() {
        $scope.loading = true;
        var objs = {
            "SysID": "select * from [dbo].[tb_root_codes] order by code asc"
        };
        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function (res) {
            $scope.codes = res.data;
            $scope.loading = false;
        }, function () {
            $scope.loading = false;
        });
    }

    loadFromDB();

    // ============ ADD CODE TO DB ============
    $scope.addCode = function () {
        var code = ($scope.newCode || '').trim().toUpperCase();
        var desc = ($scope.newDesc || '').trim();
        $scope.errorMsg = '';

        if (!code) {
            $scope.errorMsg = 'Please enter a code.';
            return;
        }

        $scope.saving = true;
        var objs = {
            "SysID": "exec [dbo].[tb_root_code_save] '" + code + "','" + desc + "'"
        };
        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function () {
            $scope.newCode = '';
            $scope.newDesc = '';
            $scope.saving = false;
            loadFromDB();
        }, function () {
            $scope.errorMsg = 'Failed to save. Please try again.';
            $scope.saving = false;
        });
    };

    // ============ DELETE CODE FROM DB ============
    $scope.deleteCode = function (item) {
        if (!confirm('Delete code "' + item.code + '"?')) return;

        var objs = {
            "SysID": "exec [dbo].[tb_root_code_delete] " + item.SysID
        };
        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function () {
            loadFromDB();
        });
    };

});
