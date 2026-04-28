var app = angular.module('PHVApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter, $timeout) {

    var lat = "";
    var lng = "";
    var cameraStream = null;
    var currentCameraField = "";

    $scope.cameraTitle = "Capture Photo";

    // ============ ROOT CODE (promoter territory — persists in localStorage) ============

    $scope.rootCode = localStorage.getItem('tb_active_code') || '';
    $scope.rcSavedCodes = [];
    $scope.rcLoading = false;
    $scope.showRCPanel = false;

    function fetchCodesFromDB() {
        $scope.rcLoading = true;
        $scope.rcSavedCodes = [];
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "select * from [dbo].[tb_root_codes] order by code asc"
        })).then(function (res) {
            $scope.rcSavedCodes = res.data;
            $scope.rcLoading = false;
        }, function () { $scope.rcLoading = false; });
    }

    $scope.openRCPanel = function () {
        $scope.showRCPanel = true;
        fetchCodesFromDB();
    };

    $scope.closeRCPanel = function () { $scope.showRCPanel = false; };
    $scope.closeRCPanelOutside = function () { $scope.showRCPanel = false; };

    $scope.selectRootCode = function (code) {
        localStorage.setItem('tb_active_code', code);
        $scope.rootCode = code;
        $scope.showRCPanel = false;
    };

    if (!$scope.rootCode) {
        $timeout(function () { $scope.openRCPanel(); }, 400);
    }

    // ============ OUTLET / SHOP SELECTION (per visit) ============

    $scope.outlets = [];
    $scope.selectedOutletCode = '';
    $scope.selectedOutlet = null;
    $scope.outletLoading = false;
    $scope.showOutletPanel = false;

    function fetchOutlets() {
        $scope.outletLoading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "select * from [dbo].[tb_outlets] order by outlet_code asc"
        })).then(function (res) {
            $scope.outlets = res.data;
            $scope.outletLoading = false;
        }, function () { $scope.outletLoading = false; });
    }

    $scope.openOutletPanel = function () {
        $scope.showOutletPanel = true;
        fetchOutlets();
    };

    $scope.closeOutletPanel = function () { $scope.showOutletPanel = false; };
    $scope.closeOutletPanelOutside = function () { $scope.showOutletPanel = false; };

    $scope.selectOutlet = function (outlet) {
        $scope.selectedOutletCode = outlet.outlet_code;
        $scope.selectedOutlet = outlet;
        $scope.showOutletPanel = false;
    };

    // ============ FONTERRA PRODUCTS CHECKLIST ============

    $scope.fonterraProducts = [];
    $scope.productsLoading = false;

    function fetchProducts() {
        $scope.productsLoading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "select * from [dbo].[tb_products] order by SysID asc"
        })).then(function (res) {
            $scope.fonterraProducts = res.data.map(function (p) {
                return { SysID: p.SysID, product_name: p.product_name, checked: false };
            });
            $scope.productsLoading = false;
        }, function () { $scope.productsLoading = false; });
    }

    fetchProducts();

    // ============ GPS ============

    $scope.loadgps = function () {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(
                function (position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    $scope.live_location = lat + ", " + lng;
                    $scope.$apply();
                },
                function (error) { console.error("GPS error:", error); }
            );
        }
    };

    $scope.loadgps();

    // ============ CLEAR FORM ============

    $scope.cls = function () {
        $scope.selectedOutletCode = '';
        $scope.selectedOutlet = null;
        $scope.live_location = "";
        $scope.competitor_text = "";

        $scope.boardPreview = "";
        $scope.rackBeforePreview = "";
        $scope.rackAfterPreview = "";
        $scope.signaturePreview = "";
        $scope.selfiePreview = "";
        $scope.selfieTimestamp = "";
        $scope.rackFonterraPreview = "";
        $scope.competitorRackPreview = "";

        $scope.selFileBoard = null;
        $scope.selFileRackBefore = null;
        $scope.selFileRackAfter = null;
        $scope.selFileSignature = null;
        $scope.selFileSelfie = null;
        $scope.selFileRackFonterra = null;
        $scope.selFileCompetitorRack = null;

        $scope.fileExBoard = "";
        $scope.fileExRackBefore = "";
        $scope.fileExRackAfter = "";
        $scope.fileExSignature = "";

        // Reset checklist without reloading from DB
        angular.forEach($scope.fonterraProducts, function (p) { p.checked = false; });

        $scope.validationErrors = [];
    };

    $scope.cls();

    // ============ FILE UPLOAD ============

    $scope.uploadFile = function (file, fileName) {
        var data = new FormData();
        data.append("FileName", fileName);
        data.append("file", file);
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open("POST", "./api/fileup/UploadImage");
        xhr.send(data);
    };

    $scope.file_up = function (id) {
        if ($scope.selFileBoard)          $scope.uploadFile($scope.selFileBoard,          id + '_board.' + $scope.fileExBoard);
        if ($scope.selFileRackBefore)     $scope.uploadFile($scope.selFileRackBefore,     id + '_rack_before.' + $scope.fileExRackBefore);
        if ($scope.selFileRackAfter)      $scope.uploadFile($scope.selFileRackAfter,      id + '_rack_after.' + $scope.fileExRackAfter);
        if ($scope.selFileSignature)      $scope.uploadFile($scope.selFileSignature,      id + '_signature.' + $scope.fileExSignature);
        if ($scope.selFileSelfie)         $scope.uploadFile($scope.selFileSelfie,         id + '_selfie.jpg');
        if ($scope.selFileRackFonterra)   $scope.uploadFile($scope.selFileRackFonterra,   id + '_rack_fonterra.jpg');
        if ($scope.selFileCompetitorRack) $scope.uploadFile($scope.selFileCompetitorRack, id + '_competitor_rack.jpg');
    };

    // ============ SAVE ============

    $scope.data_saveing = 0;
    $scope.save = function () {
        if (!$scope.rootCode) { $scope.openRCPanel(); return; }

        $scope.validationErrors = [];
        if (!$scope.selectedOutletCode)  $scope.validationErrors.push('Shop (select from the outlet list)');
        if (!$scope.selFileBoard)        $scope.validationErrors.push('Shop Name Board Picture');
        if (!$scope.live_location)       $scope.validationErrors.push('Live Location');
        if (!$scope.selFileRackBefore)   $scope.validationErrors.push('Shop Product Rack Before Picture');
        if (!$scope.selFileRackAfter)    $scope.validationErrors.push('Shop Product Rack After Picture');
        if (!$scope.selFileSignature)    $scope.validationErrors.push('Shop Owner Signature Picture');
        if (!$scope.selFileSelfie)       $scope.validationErrors.push('Selfie with Shop');
        if ($scope.validationErrors.length > 0) return;

        if (Number($scope.data_saveing) !== 0) return;
        $scope.data_saveing = 1;

        var checklist = $scope.fonterraProducts
            .filter(function (p) { return p.checked; })
            .map(function (p) { return p.product_name; })
            .join(',');

        var objs = {
            "SysID": "exec [dbo].[tb_shop_visit_call] '"
                + $scope.selectedOutletCode      + "','"
                + lat                            + "','"
                + lng                            + "','"
                + $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss') + "','"
                + $scope.rootCode                + "','"
                + ($scope.competitor_text || '') + "','"
                + checklist                      + "'"
        };

        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function (responsea) {
            var id = responsea.data[0].i;
            $scope.data_saveing = 2;
            $timeout(function () {
                $scope.data_saveing = 0;
                $scope.cls();
            }, 3000);

            var boardFileName          = $scope.selFileBoard          ? id + '_board.' + $scope.fileExBoard              : '';
            var rackBeforeFileName     = $scope.selFileRackBefore     ? id + '_rack_before.' + $scope.fileExRackBefore   : '';
            var rackAfterFileName      = $scope.selFileRackAfter      ? id + '_rack_after.' + $scope.fileExRackAfter     : '';
            var signatureFileName      = $scope.selFileSignature      ? id + '_signature.' + $scope.fileExSignature      : '';
            var selfieFileName         = $scope.selFileSelfie         ? id + '_selfie.jpg'                               : '';
            var rackFonterraFileName   = $scope.selFileRackFonterra   ? id + '_rack_fonterra.jpg'                        : '';
            var competitorRackFileName = $scope.selFileCompetitorRack ? id + '_competitor_rack.jpg'                      : '';

            var updateObj = {
                "SysID": "exec [dbo].[tb_shop_visit_update_files] "
                    + id                       + ",'"
                    + boardFileName            + "','"
                    + rackBeforeFileName       + "','"
                    + rackAfterFileName        + "','"
                    + signatureFileName        + "','"
                    + selfieFileName           + "','"
                    + rackFonterraFileName     + "','"
                    + competitorRackFileName   + "'"
            };
            $http.post('./api/Mater/sp', JSON.stringify(updateObj));
            $scope.file_up(id);

        }, function () {
            $scope.data_saveing = 0;
        });
    };

    // ============ CAMERA ============

    var cameraTitles = {
        'board':          'Capture Shop Name Board',
        'rackBefore':     'Capture Rack Before',
        'rackAfter':      'Capture Rack After',
        'signature':      'Capture Owner Signature',
        'selfie':         'Capture Selfie with Shop',
        'rackFonterra':   'Capture Fonterra Rack',
        'competitorRack': 'Capture Competitor Rack'
    };

    $scope.openCameraFor = function (fieldName) {
        currentCameraField = fieldName;
        $scope.cameraTitle = cameraTitles[fieldName] || 'Capture Photo';
        var facingMode = (fieldName === 'selfie') ? "user" : { ideal: "environment" };

        $('#cameraModal').modal('show');
        navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode }, audio: false })
            .then(function (stream) {
                cameraStream = stream;
                var video = document.getElementById('cameraVideo');
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err) {
                console.error("Camera error:", err);
                alert("Unable to access camera. Please allow camera permission.");
            });
    };

    $scope.capturePhoto = function () {
        var video  = document.getElementById('cameraVideo');
        var canvas = document.getElementById('cameraCanvas');
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        var now = new Date();
        var timestamp = $filter('date')(now, 'yyyy/MM/dd HH:mm:ss');

        if (currentCameraField === 'selfie') {
            var fontSize = Math.max(16, Math.floor(canvas.width / 25));
            ctx.font = "bold " + fontSize + "px Arial";
            var textWidth = ctx.measureText(timestamp).width;
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(canvas.width - textWidth - 20, canvas.height - fontSize - 20, textWidth + 15, fontSize + 15);
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(timestamp, canvas.width - textWidth - 12, canvas.height - 18);

            if (lat && lng) {
                var gpsText = "GPS: " + Number(lat).toFixed(6) + ", " + Number(lng).toFixed(6);
                var gpsFontSize = Math.max(12, Math.floor(canvas.width / 35));
                ctx.font = "bold " + gpsFontSize + "px Arial";
                var gpsTextWidth = ctx.measureText(gpsText).width;
                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect(canvas.width - gpsTextWidth - 20, canvas.height - fontSize - gpsFontSize - 35, gpsTextWidth + 15, gpsFontSize + 15);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(gpsText, canvas.width - gpsTextWidth - 12, canvas.height - fontSize - 28);
            }
        }

        var field = currentCameraField;
        canvas.toBlob(function (blob) {
            var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            if      (field === 'board')          { $scope.selFileBoard = blob;          $scope.fileExBoard = 'jpg';          $scope.boardPreview = dataUrl; }
            else if (field === 'rackBefore')      { $scope.selFileRackBefore = blob;     $scope.fileExRackBefore = 'jpg';     $scope.rackBeforePreview = dataUrl; }
            else if (field === 'rackAfter')       { $scope.selFileRackAfter = blob;      $scope.fileExRackAfter = 'jpg';      $scope.rackAfterPreview = dataUrl; }
            else if (field === 'signature')       { $scope.selFileSignature = blob;      $scope.fileExSignature = 'jpg';      $scope.signaturePreview = dataUrl; }
            else if (field === 'selfie')          { $scope.selFileSelfie = blob;         $scope.selfiePreview = dataUrl;      $scope.selfieTimestamp = timestamp; }
            else if (field === 'rackFonterra')    { $scope.selFileRackFonterra = blob;   $scope.rackFonterraPreview = dataUrl; }
            else if (field === 'competitorRack')  { $scope.selFileCompetitorRack = blob; $scope.competitorRackPreview = dataUrl; }
            $scope.$apply();
        }, 'image/jpeg', 0.85);

        $scope.closeCamera();
        $('#cameraModal').modal('hide');
    };

    $scope.closeCamera = function () {
        if (cameraStream) {
            cameraStream.getTracks().forEach(function (t) { t.stop(); });
            cameraStream = null;
        }
        var video = document.getElementById('cameraVideo');
        if (video) video.srcObject = null;
        currentCameraField = "";
    };

});
