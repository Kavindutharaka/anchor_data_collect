var app = angular.module('ProApp', []);
app.controller('ProCtrl', function ($scope, $http, $filter) {

    // ============ PROMOTER MANAGEMENT ============

    $scope.promoters   = [];
    $scope.newName     = '';
    $scope.newPhone    = '';
    $scope.newEmpId    = '';
    $scope.newPromoId  = '';
    $scope.newPassword = '';
    $scope.errorMsg    = '';
    $scope.loading     = false;
    $scope.saving      = false;

    function loadPromoters() {
        $scope.loading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; SELECT * FROM [dbo].[tb_promoters] ORDER BY name ASC"
        })).then(function (res) {
            $scope.promoters = res.data;
            $scope.loading   = false;
        }, function () { $scope.loading = false; });
    }

    loadPromoters();

    $scope.addPromoter = function () {
        var name    = ($scope.newName     || '').trim();
        var phone   = ($scope.newPhone    || '').trim();
        var emp     = ($scope.newEmpId    || '').trim();
        var promoId = ($scope.newPromoId  || '').trim();
        var pass    = ($scope.newPassword || '').trim();
        $scope.errorMsg = '';

        if (!name)    { $scope.errorMsg = 'Please enter promoter name.';    return; }
        if (!phone)   { $scope.errorMsg = 'Please enter phone number.';     return; }
        if (!emp)     { $scope.errorMsg = 'Please enter employee ID.';      return; }
        if (!promoId) { $scope.errorMsg = 'Please enter promo ID.';         return; }
        if (!pass)    { $scope.errorMsg = 'Please enter a password.';       return; }

        $scope.saving = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_promoter_save] '" + name + "','" + phone + "','" + emp + "','" + promoId + "','" + pass + "'"
        })).then(function () {
            $scope.newName     = '';
            $scope.newPhone    = '';
            $scope.newEmpId    = '';
            $scope.newPromoId  = '';
            $scope.newPassword = '';
            $scope.saving      = false;
            loadPromoters();
        }, function () {
            $scope.errorMsg = 'Failed to save. Please try again.';
            $scope.saving   = false;
        });
    };

    $scope.deletePromoter = function (item) {
        if (!confirm('Delete promoter "' + item.name + '"?\nThis cannot be undone.')) return;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_promoter_delete] " + item.SysID
        })).then(function () { loadPromoters(); });
    };

    // ============ ATTENDANCE SHEET ============

    $scope.att_promoters  = [];
    $scope.att_promoter   = '';
    $scope.att_from       = null;
    $scope.att_to         = null;
    $scope.att_records    = [];
    $scope.att_loading    = false;
    $scope.att_searched   = false;

    // Load promoter list for attendance filter dropdown
    function loadAttPromoters() {
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; SELECT name FROM [dbo].[tb_promoters] ORDER BY name ASC"
        })).then(function (res) { $scope.att_promoters = res.data; });
    }

    loadAttPromoters();

    $scope.generateAttendance = function () {
        if (!$scope.att_promoter) { alert('Please select a promoter.'); return; }

        var conditions = ["v.promoter_name = '" + $scope.att_promoter + "'"];
        if ($scope.att_from) {
            conditions.push("v.created_dt >= '" + $filter('date')($scope.att_from, 'yyyy/MM/dd') + "'");
        }
        if ($scope.att_to) {
            conditions.push("v.created_dt <= '" + $filter('date')($scope.att_to, 'yyyy/MM/dd') + " 23:59:59'");
        }

        $scope.att_loading  = true;
        $scope.att_searched = false;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; SELECT v.promoter_name, v.created_dt, v.outlet_code, o.shop_name, o.town FROM [dbo].[tb_shop_visit] v LEFT JOIN [dbo].[tb_outlets] o ON v.outlet_code = o.outlet_code WHERE " + conditions.join(' AND ') + " ORDER BY v.created_dt DESC"
        })).then(function (res) {
            $scope.att_records  = res.data;
            $scope.att_loading  = false;
            $scope.att_searched = true;
        }, function () { $scope.att_loading = false; });
    };

    $scope.downloadCSV = function () {
        if (!$scope.att_records.length) return;

        var header = 'Promoter Name,Date,Outlet Code,Shop Name,Town\n';
        var rows = $scope.att_records.map(function (r) {
            return [
                '"' + (r.promoter_name || '') + '"',
                '"' + (r.created_dt    || '') + '"',
                '"' + (r.outlet_code   || '') + '"',
                '"' + (r.shop_name     || '') + '"',
                '"' + (r.town          || '') + '"'
            ].join(',');
        }).join('\n');

        var csv  = header + rows;
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href     = url;
        a.download = 'attendance_' + ($scope.att_promoter || 'all') + '_' + $filter('date')(new Date(), 'yyyyMMdd') + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

});
