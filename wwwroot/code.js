var app = angular.module('CodeApp', []);
app.controller('CodeCtrl', function ($scope, $http) {

    // ============ ROOT CODES ============

    $scope.codes = [];
    $scope.newCode = '';
    $scope.newDesc = '';
    $scope.errorMsg = '';
    $scope.loading = false;
    $scope.saving = false;

    function loadCodes() {
        $scope.loading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "select * from [dbo].[tb_root_codes] order by code asc"
        })).then(function (res) {
            $scope.codes = res.data;
            $scope.loading = false;
        }, function () { $scope.loading = false; });
    }

    loadCodes();

    $scope.addCode = function () {
        var code = ($scope.newCode || '').trim().toUpperCase();
        var desc = ($scope.newDesc || '').trim();
        $scope.errorMsg = '';
        if (!code) { $scope.errorMsg = 'Please enter a code.'; return; }
        $scope.saving = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "exec [dbo].[tb_root_code_save] '" + code + "','" + desc + "'"
        })).then(function () {
            $scope.newCode = '';
            $scope.newDesc = '';
            $scope.saving = false;
            loadCodes();
        }, function () {
            $scope.errorMsg = 'Failed to save. Please try again.';
            $scope.saving = false;
        });
    };

    $scope.deleteCode = function (item) {
        if (!confirm('Delete code "' + item.code + '"?')) return;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "exec [dbo].[tb_root_code_delete] " + item.SysID
        })).then(function () { loadCodes(); });
    };

    // ============ SHOP REGISTRATION ============

    $scope.shops = [];
    $scope.newShopName = '';
    $scope.newShopTown = '';
    $scope.newShopContact = '';
    $scope.shopErrorMsg = '';
    $scope.shopsLoading = false;
    $scope.shopSaving = false;

    function loadShops() {
        $scope.shopsLoading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "select * from [dbo].[tb_outlets] order by SysID desc"
        })).then(function (res) {
            $scope.shops = res.data;
            $scope.shopsLoading = false;
        }, function () { $scope.shopsLoading = false; });
    }

    loadShops();

    $scope.addShop = function () {
        var name    = ($scope.newShopName    || '').trim();
        var town    = ($scope.newShopTown    || '').trim();
        var contact = ($scope.newShopContact || '').trim();
        $scope.shopErrorMsg = '';

        if (!name)    { $scope.shopErrorMsg = 'Please enter shop name.';     return; }
        if (!town)    { $scope.shopErrorMsg = 'Please enter town.';          return; }
        if (!contact) { $scope.shopErrorMsg = 'Please enter owner contact.'; return; }

        $scope.shopSaving = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "exec [dbo].[tb_outlet_save] '" + name + "','" + town + "','" + contact + "'"
        })).then(function (res) {
            var code = res.data && res.data[0] ? res.data[0].outlet_code : '';
            $scope.newShopName    = '';
            $scope.newShopTown    = '';
            $scope.newShopContact = '';
            $scope.shopSaving     = false;
            if (code) alert('Shop registered!\nOutlet Code: ' + code);
            loadShops();
        }, function () {
            $scope.shopErrorMsg = 'Failed to register. Please try again.';
            $scope.shopSaving   = false;
        });
    };

    $scope.deleteShop = function (item) {
        if (!confirm('Delete shop "' + item.outlet_code + '"?\nThis cannot be undone.')) return;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "exec [dbo].[tb_outlet_delete] " + item.SysID
        })).then(function () { loadShops(); });
    };

    // ============ FONTERRA PRODUCTS ============

    $scope.products = [];
    $scope.newProduct = '';
    $scope.productErrorMsg = '';
    $scope.productsLoading = false;
    $scope.productSaving = false;

    function loadProducts() {
        $scope.productsLoading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "select * from [dbo].[tb_products] order by SysID asc"
        })).then(function (res) {
            $scope.products = res.data;
            $scope.productsLoading = false;
        }, function () { $scope.productsLoading = false; });
    }

    loadProducts();

    $scope.addProduct = function () {
        var name = ($scope.newProduct || '').trim();
        $scope.productErrorMsg = '';
        if (!name) { $scope.productErrorMsg = 'Please enter product name.'; return; }
        $scope.productSaving = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "exec [dbo].[tb_product_save] '" + name + "'"
        })).then(function () {
            $scope.newProduct      = '';
            $scope.productSaving   = false;
            loadProducts();
        }, function () {
            $scope.productErrorMsg = 'Failed to save. Please try again.';
            $scope.productSaving   = false;
        });
    };

    $scope.deleteProduct = function (item) {
        if (!confirm('Delete product "' + item.product_name + '"?')) return;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "exec [dbo].[tb_product_delete] " + item.SysID
        })).then(function () { loadProducts(); });
    };

});
