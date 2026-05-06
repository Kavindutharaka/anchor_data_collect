var app = angular.module('CodeApp', []);
app.controller('CodeCtrl', function ($scope, $http) {

    // ============ FONTERRA PRODUCTS ============

    $scope.products        = [];
    $scope.newProduct      = '';
    $scope.productErrorMsg = '';
    $scope.productsLoading = false;
    $scope.productSaving   = false;

    function loadProducts() {
        $scope.productsLoading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; SELECT * FROM [dbo].[tb_products] ORDER BY SysID ASC"
        })).then(function (res) {
            $scope.products        = res.data;
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
        console.log("this is item : ", item);
        console.log(`USE [phvtechc_tb]; exec [dbo].[tb_product_delete] ${item.sysID}`);
        if (!confirm('Delete product "' + item.product_name + '"?')) return;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_product_delete] " + item.sysID
        })).then(function () { loadProducts(); });
    };

});
