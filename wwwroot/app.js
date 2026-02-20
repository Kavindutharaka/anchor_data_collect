var app = angular.module('PHVApp', []);
app.controller('HomeCtrl', function ($scope, $http, $filter, $rootScope, $window, $timeout, $location) {


    var lat = "";
    var lng = "";
    var cameraStream = null;
    var currentCameraField = ""; // tracks which field the camera is open for

    $scope.cameraTitle = "Capture Photo";

    $scope.loadgps = function () {

        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(
                function (position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    $scope.live_location = lat + ", " + lng;
                    $scope.$apply();
                    console.log("Latitude: " + lat + ", longitude: " + lng);
                },
                function (error) {
                    console.error("Error getting user location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    $scope.loadgps();

    $scope.cls = function () {
        $scope.shop_name = "";
        $scope.owner_contact = "";
        $scope.shop_address = "";
        $scope.live_location = "";
        $scope.boardPreview = "";
        $scope.rackBeforePreview = "";
        $scope.rackAfterPreview = "";
        $scope.signaturePreview = "";
        $scope.selfiePreview = "";
        $scope.selfieTimestamp = "";
        $scope.selFileBoard = null;
        $scope.selFileRackBefore = null;
        $scope.selFileRackAfter = null;
        $scope.selFileSignature = null;
        $scope.selFileSelfie = null;
        $scope.fileExBoard = "";
        $scope.fileExRackBefore = "";
        $scope.fileExRackAfter = "";
        $scope.fileExSignature = "";
        // Reset file inputs
        var fileInputs = document.querySelectorAll('input[type="file"]');
        for (var i = 0; i < fileInputs.length; i++) {
            fileInputs[i].value = '';
        }
    };

    $scope.cls();

    // Generic file upload function
    $scope.uploadFile = function (file, fileName) {
        var data = new FormData();
        data.append("FileName", fileName);
        data.append("file", file);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log("Uploaded: " + fileName + " - " + this.responseText);
            }
        });
        xhr.open("POST", "./api/fileup/UploadImage");
        xhr.send(data);
    };

    $scope.file_up = function (id) {
        // Upload Board Picture
        if ($scope.selFileBoard) {
            $scope.uploadFile($scope.selFileBoard, id + '_board.' + $scope.fileExBoard);
        }
        // Upload Rack Before Picture
        if ($scope.selFileRackBefore) {
            $scope.uploadFile($scope.selFileRackBefore, id + '_rack_before.' + $scope.fileExRackBefore);
        }
        // Upload Rack After Picture
        if ($scope.selFileRackAfter) {
            $scope.uploadFile($scope.selFileRackAfter, id + '_rack_after.' + $scope.fileExRackAfter);
        }
        // Upload Signature Picture
        if ($scope.selFileSignature) {
            $scope.uploadFile($scope.selFileSignature, id + '_signature.' + $scope.fileExSignature);
        }
        // Upload Selfie (captured from camera as blob)
        if ($scope.selFileSelfie) {
            $scope.uploadFile($scope.selFileSelfie, id + '_selfie.jpg');
        }

        $timeout(function () {
            $window.location.reload();
        }, 20000);
    };

    $scope.data_saveing = 0;
    $scope.save = function () {
        if (Number($scope.data_saveing) == 0) {
            $scope.data_saveing = 1;
            // Step 1: Insert basic data and get ID
            var objs = {
                "SysID": "exec [dbo].[tb_shop_visit_call] '" + $scope.shop_name + "','" + $scope.owner_contact + "','" + $scope.shop_address + "','" + lat + "','" + lng + "','" + $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss') + "'"
            };
            console.log(objs);
            $http.post('./api/Mater/sp', JSON.stringify(objs)).then(function (responsea) {
                console.log(responsea.data[0].i);
                var id = responsea.data[0].i;

                // Build filenames using the returned ID
                var boardFileName = $scope.selFileBoard ? id + '_board.' + $scope.fileExBoard : '';
                var rackBeforeFileName = $scope.selFileRackBefore ? id + '_rack_before.' + $scope.fileExRackBefore : '';
                var rackAfterFileName = $scope.selFileRackAfter ? id + '_rack_after.' + $scope.fileExRackAfter : '';
                var signatureFileName = $scope.selFileSignature ? id + '_signature.' + $scope.fileExSignature : '';
                var selfieFileName = $scope.selFileSelfie ? id + '_selfie.jpg' : '';

                // Step 2: Update record with actual filenames
                var updateObj = {
                    "SysID": "exec [dbo].[tb_shop_visit_update_files] '" + id + "','" + boardFileName + "','" + rackBeforeFileName + "','" + rackAfterFileName + "','" + signatureFileName + "','" + selfieFileName + "'"
                };
                $http.post('./api/Mater/sp', JSON.stringify(updateObj)).then(function (res) {
                    console.log("Filenames saved to DB");
                }, function (res) { });

                // Step 3: Upload the actual files
                $scope.file_up(id);
            }, function (responsea) {
                $scope.data_saveing = 0;
            });
        }
    };

    // --- File Select Handlers (from Upload button) ---

    $scope.SelectFileBoard = function (e) {
        var file = e.target.files[0];
        if (!file) return;
        $scope.selFileBoard = file;
        var nameParts = file.name.split(".");
        $scope.fileExBoard = nameParts[nameParts.length - 1];
        var reader = new FileReader();
        reader.onload = function (ev) {
            $scope.boardPreview = ev.target.result;
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    };

    $scope.SelectFileRackBefore = function (e) {
        var file = e.target.files[0];
        if (!file) return;
        $scope.selFileRackBefore = file;
        var nameParts = file.name.split(".");
        $scope.fileExRackBefore = nameParts[nameParts.length - 1];
        var reader = new FileReader();
        reader.onload = function (ev) {
            $scope.rackBeforePreview = ev.target.result;
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    };

    $scope.SelectFileRackAfter = function (e) {
        var file = e.target.files[0];
        if (!file) return;
        $scope.selFileRackAfter = file;
        var nameParts = file.name.split(".");
        $scope.fileExRackAfter = nameParts[nameParts.length - 1];
        var reader = new FileReader();
        reader.onload = function (ev) {
            $scope.rackAfterPreview = ev.target.result;
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    };

    $scope.SelectFileSignature = function (e) {
        var file = e.target.files[0];
        if (!file) return;
        $scope.selFileSignature = file;
        var nameParts = file.name.split(".");
        $scope.fileExSignature = nameParts[nameParts.length - 1];
        var reader = new FileReader();
        reader.onload = function (ev) {
            $scope.signaturePreview = ev.target.result;
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    };

    // --- Reusable Camera ---

    var cameraTitles = {
        'board': 'Capture Shop Name Board',
        'rackBefore': 'Capture Rack Before',
        'rackAfter': 'Capture Rack After',
        'signature': 'Capture Owner Signature',
        'selfie': 'Capture Selfie with Shop'
    };

    $scope.openCameraFor = function (fieldName) {
        currentCameraField = fieldName;
        $scope.cameraTitle = cameraTitles[fieldName] || 'Capture Photo';

        // selfie = front camera, everything else = back camera
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
        var video = document.getElementById('cameraVideo');
        var canvas = document.getElementById('cameraCanvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext('2d');

        // Draw the video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Add timestamp + GPS overlay for selfie only
        var now = new Date();
        var timestamp = $filter('date')(now, 'yyyy/MM/dd HH:mm:ss');

        if (currentCameraField === 'selfie') {
            var fontSize = Math.max(16, Math.floor(canvas.width / 25));
            ctx.font = "bold " + fontSize + "px Arial";
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            var textWidth = ctx.measureText(timestamp).width;
            ctx.fillRect(canvas.width - textWidth - 20, canvas.height - fontSize - 20, textWidth + 15, fontSize + 15);
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(timestamp, canvas.width - textWidth - 12, canvas.height - 18);

            if (lat && lng) {
                var gpsText = "GPS: " + Number(lat).toFixed(6) + ", " + Number(lng).toFixed(6);
                var gpsFontSize = Math.max(12, Math.floor(canvas.width / 35));
                ctx.font = "bold " + gpsFontSize + "px Arial";
                var gpsTextWidth = ctx.measureText(gpsText).width;
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(canvas.width - gpsTextWidth - 20, canvas.height - fontSize - gpsFontSize - 35, gpsTextWidth + 15, gpsFontSize + 15);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(gpsText, canvas.width - gpsTextWidth - 12, canvas.height - fontSize - 28);
            }
        }

        // Convert canvas to blob and assign to the correct field
        var field = currentCameraField;
        canvas.toBlob(function (blob) {
            var dataUrl = canvas.toDataURL('image/jpeg', 0.85);

            if (field === 'board') {
                $scope.selFileBoard = blob;
                $scope.fileExBoard = 'jpg';
                $scope.boardPreview = dataUrl;
            } else if (field === 'rackBefore') {
                $scope.selFileRackBefore = blob;
                $scope.fileExRackBefore = 'jpg';
                $scope.rackBeforePreview = dataUrl;
            } else if (field === 'rackAfter') {
                $scope.selFileRackAfter = blob;
                $scope.fileExRackAfter = 'jpg';
                $scope.rackAfterPreview = dataUrl;
            } else if (field === 'signature') {
                $scope.selFileSignature = blob;
                $scope.fileExSignature = 'jpg';
                $scope.signaturePreview = dataUrl;
            } else if (field === 'selfie') {
                $scope.selFileSelfie = blob;
                $scope.selfiePreview = dataUrl;
                $scope.selfieTimestamp = timestamp;
            }
            $scope.$apply();
        }, 'image/jpeg', 0.85);

        // Close camera
        $scope.closeCamera();
        $('#cameraModal').modal('hide');
    };

    $scope.closeCamera = function () {
        if (cameraStream) {
            var tracks = cameraStream.getTracks();
            for (var i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
            cameraStream = null;
        }
        var video = document.getElementById('cameraVideo');
        if (video) {
            video.srcObject = null;
        }
        currentCameraField = "";
    };

});
