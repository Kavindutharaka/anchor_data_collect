var app = angular.module('PHVApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter, $timeout) {

    var lat = "";
    var lng = "";
    var cameraStream = null;
    var currentCameraField = "";

    $scope.cameraTitle = "Capture Photo";

    // ============ PROMOTER LOGIN ============

    $scope.selectedPromoterName = localStorage.getItem('tb_promoter_name') || '';
    $scope.showLoginPanel       = false;
    $scope.loginPromoId         = '';
    $scope.loginPassword        = '';
    $scope.loginError           = '';
    $scope.loginLoading         = false;

    $scope.openLoginPanel = function () {
        $scope.loginPromoId  = '';
        $scope.loginPassword = '';
        $scope.loginError    = '';
        $scope.showLoginPanel = true;
    };

    $scope.doLogin = function () {
        var promoId = ($scope.loginPromoId  || '').trim();
        var pass    = ($scope.loginPassword || '').trim();
        if (!promoId || !pass) { $scope.loginError = 'Please enter Promo ID and password.'; return; }

        $scope.loginLoading = true;
        $scope.loginError   = '';
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_promoter_login] '" + promoId + "','" + pass + "'"
        })).then(function (res) {
            $scope.loginLoading = false;
            if (res.data && res.data.length > 0 && res.data[0].name) {
                var name = res.data[0].name;
                localStorage.setItem('tb_promoter_name', name);
                $scope.selectedPromoterName = name;
                $scope.showLoginPanel = false;
            } else {
                $scope.loginError = 'Invalid Promo ID or password. Please try again.';
            }
        }, function () {
            $scope.loginLoading = false;
            $scope.loginError   = 'Login failed. Please try again.';
        });
    };

    // Show login on first load if no promoter saved
    if (!$scope.selectedPromoterName) {
        $timeout(function () { $scope.openLoginPanel(); }, 400);
    }

    // ============ OUTLET / SHOP SELECTION ============

    $scope.outlets          = [];
    $scope.selectedOutletCode = '';
    $scope.selectedOutlet   = null;
    $scope.outletLoading    = false;
    $scope.showOutletPanel  = false;
    $scope.outletSearch     = '';

    function fetchOutlets() {
        $scope.outletLoading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; SELECT * FROM [dbo].[tb_outlets] ORDER BY outlet_code ASC"
        })).then(function (res) {
            $scope.outlets       = res.data;
            $scope.outletLoading = false;
        }, function () { $scope.outletLoading = false; });
    }

    $scope.openOutletPanel = function () {
        $scope.outletSearch    = '';
        $scope.showOutletPanel = true;
        fetchOutlets();
    };

    $scope.closeOutletPanel        = function () { $scope.showOutletPanel = false; };
    $scope.closeOutletPanelOutside = function () { $scope.showOutletPanel = false; };

    $scope.selectOutlet = function (outlet) {
        $scope.selectedOutletCode = outlet.outlet_code;
        $scope.selectedOutlet     = outlet;
        $scope.showOutletPanel    = false;
    };

    // ============ NEW SHOP REGISTRATION ============

    $scope.showNewShopPanel = false;
    $scope.newShopName      = '';
    $scope.newShopTown      = '';
    $scope.newShopContact   = '';
    $scope.newShopError     = '';
    $scope.newShopSaving    = false;

    $scope.openNewShopPanel = function () {
        $scope.newShopName    = '';
        $scope.newShopTown    = '';
        $scope.newShopContact = '';
        $scope.newShopError   = '';
        $scope.showNewShopPanel = true;
    };

    $scope.closeNewShopPanel = function () { $scope.showNewShopPanel = false; };

    $scope.saveNewShop = function () {
        var name    = ($scope.newShopName    || '').trim();
        var town    = ($scope.newShopTown    || '').trim();
        var contact = ($scope.newShopContact || '').trim();
        $scope.newShopError = '';

        if (!name) { $scope.newShopError = 'Shop name is required.'; return; }
        if (!town) { $scope.newShopError = 'Town is required.';      return; }

        $scope.newShopSaving = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_outlet_save] '" + name + "','" + town + "','" + contact + "'"
        })).then(function (res) {
            $scope.newShopSaving    = false;
            $scope.showNewShopPanel = false;
            if (res.data && res.data.length > 0 && res.data[0].outlet_code) {
                var code = res.data[0].outlet_code;
                $scope.selectedOutletCode = code;
                $scope.selectedOutlet = {
                    outlet_code:   code,
                    shop_name:     name,
                    town:          town,
                    owner_contact: contact
                };
            }
            fetchOutlets(); // refresh list in background
        }, function () {
            $scope.newShopSaving = false;
            $scope.newShopError  = 'Failed to save. Please try again.';
        });
    };

    // ============ PRODUCTS — FONTERRA CHECKLIST / NEW ORDERS / PROMOTED ============

    $scope.fonterraProducts = [];
    $scope.orderProducts    = [];
    $scope.promotedProducts = [];
    $scope.productsLoading  = false;

    // Modal states
    $scope.showFonterraModal = false;
    $scope.fonterraSearch    = '';
    $scope.showOrdersModal   = false;
    $scope.ordersSearch      = '';
    $scope.showPromotedModal = false;
    $scope.promotedSearch    = '';

    // Strip trailing weight/size from product name (e.g. "400g", "1kg", "500ml")
    function stripWeight(name) {
        return (name || '').replace(/\s+\d+(\.\d+)?\s*(g|kg|ml|l)\b\s*$/i, '').trim();
    }

    function fetchProducts() {
        $scope.productsLoading = true;
        $http.post('./api/Mater/sp', JSON.stringify({
            "SysID": "USE [phvtechc_tb]; SELECT * FROM [dbo].[tb_products] ORDER BY SysID ASC"
        })).then(function (res) {
            $scope.fonterraProducts = res.data.map(function (p) {
                return { SysID: p.SysID, product_name: p.product_name, checked: false };
            });
            $scope.orderProducts = res.data.map(function (p) {
                return { SysID: p.SysID, product_name: p.product_name, qty: null };
            });
            $scope.promotedProducts = res.data.map(function (p) {
                return { SysID: p.SysID, product_name: p.product_name, display_name: stripWeight(p.product_name), promoted: false };
            });
            $scope.productsLoading = false;
        }, function () { $scope.productsLoading = false; });
    }

    fetchProducts();

    // Counts
    $scope.fonterraSelectedCount = function () {
        return $scope.fonterraProducts.filter(function (p) { return p.checked; }).length;
    };
    $scope.ordersCount = function () {
        return $scope.orderProducts.filter(function (p) { return p.qty && Number(p.qty) > 0; }).length;
    };
    $scope.promotedCount = function () {
        return $scope.promotedProducts.filter(function (p) { return p.promoted; }).length;
    };

    // Open / Close
    $scope.openFonterraModal  = function () { $scope.fonterraSearch = ''; $scope.showFonterraModal = true; };
    $scope.closeFonterraModal = function () { $scope.showFonterraModal = false; };

    $scope.openOrdersModal  = function () { $scope.ordersSearch = ''; $scope.showOrdersModal = true; };
    $scope.closeOrdersModal = function () { $scope.showOrdersModal = false; };

    $scope.openPromotedModal  = function () { $scope.promotedSearch = ''; $scope.showPromotedModal = true; };
    $scope.closePromotedModal = function () { $scope.showPromotedModal = false; };

    // Done orders: close modal + auto-download receipt
    $scope.doneOrders = function () {
        $scope.showOrdersModal = false;
        $scope.generateReceipt();
    };

    // ============ RECEIPT GENERATION (Canvas → PNG download) ============

    $scope.generateReceipt = function () {
        var orders = $scope.orderProducts.filter(function (p) { return p.qty && Number(p.qty) > 0; });
        if (!orders.length) return;

        var shopName  = $scope.selectedOutlet ? $scope.selectedOutlet.shop_name : ($scope.selectedOutletCode || 'N/A');
        var town      = $scope.selectedOutlet ? ($scope.selectedOutlet.town || '') : '';
        var promoter  = $scope.selectedPromoterName || '';
        var dateStr   = $filter('date')(new Date(), 'yyyy/MM/dd HH:mm');

        var width    = 680;
        var padX     = 36;
        var headerH  = 82;
        var rowH     = 44;
        var tableHdr = 38;
        var footerH  = 56;
        var height   = headerH + 94 + tableHdr + (orders.length * rowH) + footerH + 16;

        var canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Header bar
        ctx.fillStyle = '#1a56db';
        ctx.fillRect(0, 0, width, headerH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('Order Receipt', padX, 40);

        // Info section
        var iy = headerH + 20;
        ctx.fillStyle = '#1e3a5f';
        ctx.font = 'bold 17px Arial';
        var shopLine = shopName + (town ? '   |   ' + town : '');
        ctx.fillText(shopLine, padX, iy);

        iy += 26;
        ctx.fillStyle = '#4b5563';
        ctx.font = '13px Arial';
        ctx.fillText('Promoter: ' + promoter, padX, iy);

        iy += 20;
        ctx.fillText('Date: ' + dateStr, padX, iy);

        iy += 22;
        // Divider
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, iy);
        ctx.lineTo(width - padX, iy);
        ctx.stroke();
        iy += 2;

        // Table header
        ctx.fillStyle = '#1a56db';
        ctx.fillRect(padX, iy, width - padX * 2, tableHdr);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.fillText('Product', padX + 14, iy + 25);
        ctx.fillText('Qty', width - padX - 52, iy + 25);
        iy += tableHdr;

        // Rows
        orders.forEach(function (o, i) {
            var rowY = iy + i * rowH;
            ctx.fillStyle = i % 2 === 0 ? '#f8fafc' : '#ffffff';
            ctx.fillRect(padX, rowY, width - padX * 2, rowH);

            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padX, rowY + rowH);
            ctx.lineTo(width - padX, rowY + rowH);
            ctx.stroke();

            // Truncate long product names
            ctx.fillStyle = '#111827';
            ctx.font = '14px Arial';
            var maxW = width - padX * 2 - 80;
            var pName = o.product_name;
            while (ctx.measureText(pName).width > maxW && pName.length > 3) {
                pName = pName.slice(0, -1);
            }
            if (pName !== o.product_name) pName += '…';
            ctx.fillText(pName, padX + 14, rowY + rowH / 2 + 6);

            ctx.fillStyle = '#1a56db';
            ctx.font = 'bold 15px Arial';
            ctx.fillText(String(o.qty), width - padX - 44, rowY + rowH / 2 + 6);
        });

        // Footer
        var footerY = iy + orders.length * rowH + 14;
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, footerY);
        ctx.lineTo(width - padX, footerY);
        ctx.stroke();
        footerY += 22;
        ctx.fillStyle = '#374151';
        ctx.font = '13px Arial';
        ctx.fillText('Total: ' + orders.length + ' product(s)', padX, footerY);

        // Download as PNG
        canvas.toBlob(function (blob) {
            var url = URL.createObjectURL(blob);
            var a   = document.createElement('a');
            a.href     = url;
            a.download = 'receipt_' + ($scope.selectedOutletCode || 'order') + '_' + $filter('date')(new Date(), 'yyyyMMdd_HHmm') + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

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
        $scope.selectedOutlet     = null;
        $scope.live_location      = "";
        $scope.competitor_text    = "";
        $scope.promoter_comments  = "";

        $scope.boardPreview         = "";
        $scope.rackBeforePreview    = "";
        $scope.rackAfterPreview     = "";
        $scope.signaturePreview     = "";
        $scope.selfiePreview        = "";
        $scope.selfieTimestamp      = "";
        $scope.rackFonterraPreview  = "";
        $scope.competitorRackPreview = "";

        $scope.selFileBoard          = null;
        $scope.selFileRackBefore     = null;
        $scope.selFileRackAfter      = null;
        $scope.selFileSignature      = null;
        $scope.selFileSelfie         = null;
        $scope.selFileRackFonterra   = null;
        $scope.selFileCompetitorRack = null;

        $scope.fileExBoard      = "";
        $scope.fileExRackBefore = "";
        $scope.fileExRackAfter  = "";
        $scope.fileExSignature  = "";

        angular.forEach($scope.fonterraProducts,  function (p) { p.checked  = false; });
        angular.forEach($scope.orderProducts,     function (p) { p.qty      = null;  });
        angular.forEach($scope.promotedProducts,  function (p) { p.promoted = false; });

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
        if (!$scope.selectedPromoterName) { $scope.openLoginPanel(); return; }

        $scope.validationErrors = [];
        if (!$scope.selectedOutletCode)    $scope.validationErrors.push('Shop (select or register from shop field)');
        if (!$scope.selFileBoard)          $scope.validationErrors.push('Shop Name Board Picture');
        if (!$scope.live_location)         $scope.validationErrors.push('Live Location');
        if (!$scope.selFileRackBefore)     $scope.validationErrors.push('Shop Product Rack Before Picture');
        if (!$scope.selFileRackAfter)      $scope.validationErrors.push('Shop Product Rack After Picture');
        if (!$scope.selFileSignature)      $scope.validationErrors.push('Shop Owner Signature Picture');
        if (!$scope.selFileSelfie)         $scope.validationErrors.push('Selfie with Shop');
        if (!$scope.selFileRackFonterra)   $scope.validationErrors.push('Upload Rack Image (Fonterra)');
        if (!$scope.selFileCompetitorRack) $scope.validationErrors.push('Capture Rack Image (Competitor)');
        if ($scope.validationErrors.length > 0) return;

        if (Number($scope.data_saveing) !== 0) return;
        $scope.data_saveing = 1;

        var checklist = $scope.fonterraProducts
            .filter(function (p) { return p.checked; })
            .map(function (p) { return p.product_name; })
            .join(',');

        var newOrders = $scope.orderProducts
            .filter(function (p) { return p.qty && Number(p.qty) > 0; })
            .map(function (p) { return p.product_name + ':' + p.qty; })
            .join('|');

        var promotedList = $scope.promotedProducts
            .filter(function (p) { return p.promoted; })
            .map(function (p) { return p.product_name; })
            .join(',');

        var objs = {
            "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_shop_visit_call] '"
                + $scope.selectedOutletCode       + "','"
                + lat                             + "','"
                + lng                             + "','"
                + $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss') + "','"
                + ($scope.competitor_text   || '') + "','"
                + checklist                        + "','"
                + ($scope.promoter_comments || '') + "','"
                + ($scope.selectedPromoterName || '') + "','"
                + newOrders                        + "','"
                + promotedList                     + "'"
        };

        $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function (responsea) {
            var id = responsea.data[0].i;
            $scope.data_saveing = 2;
            $timeout(function () {
                $scope.data_saveing = 0;
                $scope.cls();
            }, 3000);

            var boardFileName          = $scope.selFileBoard          ? id + '_board.' + $scope.fileExBoard            : '';
            var rackBeforeFileName     = $scope.selFileRackBefore     ? id + '_rack_before.' + $scope.fileExRackBefore : '';
            var rackAfterFileName      = $scope.selFileRackAfter      ? id + '_rack_after.' + $scope.fileExRackAfter   : '';
            var signatureFileName      = $scope.selFileSignature      ? id + '_signature.' + $scope.fileExSignature    : '';
            var selfieFileName         = $scope.selFileSelfie         ? id + '_selfie.jpg'                             : '';
            var rackFonterraFileName   = $scope.selFileRackFonterra   ? id + '_rack_fonterra.jpg'                      : '';
            var competitorRackFileName = $scope.selFileCompetitorRack ? id + '_competitor_rack.jpg'                    : '';

            var updateObj = {
                "SysID": "USE [phvtechc_tb]; exec [dbo].[tb_shop_visit_update_files] "
                    + id                     + ",'"
                    + boardFileName          + "','"
                    + rackBeforeFileName     + "','"
                    + rackAfterFileName      + "','"
                    + signatureFileName      + "','"
                    + selfieFileName         + "','"
                    + rackFonterraFileName   + "','"
                    + competitorRackFileName + "'"
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
            if      (field === 'board')          { $scope.selFileBoard = blob;          $scope.fileExBoard = 'jpg';      $scope.boardPreview = dataUrl; }
            else if (field === 'rackBefore')      { $scope.selFileRackBefore = blob;     $scope.fileExRackBefore = 'jpg'; $scope.rackBeforePreview = dataUrl; }
            else if (field === 'rackAfter')       { $scope.selFileRackAfter = blob;      $scope.fileExRackAfter = 'jpg';  $scope.rackAfterPreview = dataUrl; }
            else if (field === 'signature')       { $scope.selFileSignature = blob;      $scope.fileExSignature = 'jpg';  $scope.signaturePreview = dataUrl; }
            else if (field === 'selfie')          { $scope.selFileSelfie = blob;         $scope.selfiePreview = dataUrl;  $scope.selfieTimestamp = timestamp; }
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
