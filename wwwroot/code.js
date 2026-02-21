var app = angular.module('CodeApp', []);
app.controller('CodeCtrl', function ($scope) {

    var CODES_KEY = 'tb_root_codes';
    var ACTIVE_KEY = 'tb_active_code';

    function loadCodes() {
        try {
            return JSON.parse(localStorage.getItem(CODES_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveCodes(codes) {
        localStorage.setItem(CODES_KEY, JSON.stringify(codes));
    }

    $scope.codes = loadCodes();
    $scope.activeCode = localStorage.getItem(ACTIVE_KEY) || '';
    $scope.newCode = '';
    $scope.errorMsg = '';

    $scope.addCode = function () {
        var code = ($scope.newCode || '').trim().toUpperCase();
        $scope.errorMsg = '';

        if (!code) {
            $scope.errorMsg = 'Please enter a code.';
            return;
        }

        var codes = loadCodes();
        if (codes.indexOf(code) === -1) {
            codes.push(code);
            saveCodes(codes);
        }

        // Set as active
        localStorage.setItem(ACTIVE_KEY, code);
        $scope.activeCode = code;
        $scope.codes = codes;
        $scope.newCode = '';
    };

    $scope.setActive = function (code) {
        localStorage.setItem(ACTIVE_KEY, code);
        $scope.activeCode = code;
    };

    $scope.deleteCode = function (code) {
        var codes = loadCodes();
        var idx = codes.indexOf(code);
        if (idx !== -1) {
            codes.splice(idx, 1);
            saveCodes(codes);
        }
        $scope.codes = codes;

        // If we deleted the active code, clear it
        if ($scope.activeCode === code) {
            localStorage.removeItem(ACTIVE_KEY);
            $scope.activeCode = codes.length > 0 ? codes[codes.length - 1] : '';
            if ($scope.activeCode) {
                localStorage.setItem(ACTIVE_KEY, $scope.activeCode);
            }
        }
    };

});
