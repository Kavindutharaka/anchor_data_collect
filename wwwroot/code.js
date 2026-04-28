var app = angular.module('CodeApp', []);
app.controller('CodeCtrl', function ($scope, $http) {

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
            "SysID": "USE [phvtechc_tb]; SELECT * FROM [dbo].[tb_outlets] ORDER BY SysID DESC"
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
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_outlet_save] '" + name + "','" + town + "','" + contact + "'"
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
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_outlet_delete] " + item.SysID
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
            "SysID": "USE [phvtechc_tb]; SELECT * FROM [dbo].[tb_products] ORDER BY SysID ASC"
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
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_product_save] '" + name + "'"
        })).then(function () {
            $scope.newProduct    = '';
            $scope.productSaving = false;
            loadProducts();
        }, function () {
            $scope.productErrorMsg = 'Failed to save. Please try again.';
            $scope.productSaving   = false;
        });
    };

    $scope.deleteProduct = function (item) {
        if (!confirm('Delete product "' + item.product_name + '"?')) return;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_product_delete] " + item.SysID
        })).then(function () { loadProducts(); });
    };

});
