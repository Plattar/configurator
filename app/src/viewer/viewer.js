/*
	Controls the Panel that contains the controls and 3d view
*/
angular.module('PlattarConfigurator')
    .controller('viewer', ['$scope', 'config', '$sce', 'Tracker', '$timeout',
        function($scope, config, $sce, Tracker, $timeout) {

            $scope.embedUrl = $sce.trustAsResourceUrl(config.apiUrl + '/webgleditor/preview/index.html');
            $scope.hideWalkthrough = true;
            $scope.hideframe1 = true;
            $scope.hideframe2 = true;
            $scope.clickType = !mobilecheck();

            // recordClickType($scope);
            toggleCamera($scope, Tracker);
            goFullscreen($scope, Tracker);
            activateHelp($scope, $timeout, Tracker);
            resetTransforms($scope, Tracker)
            helpListeners($scope);
        }
    ]);

//It is highly unlikely for the user to have both the things. If they do, they are smart enough to interpret the meaning.
// function recordClickType($scope) {
//     var clickEvent = $(document).on('touchend click', function(e) {
//         if (e.type == 'click') {
//             $scope.clickType = true;
//         } else {
//             $scope.clickType = false;
//         }
//         $(document).off('touchend click', clickEvent);
//     });
// }

function toggleCamera($scope, Tracker) {
    var cameraEnabled = false;
    $scope.toggleCamera = function() {
        cameraEnabled = !cameraEnabled;
        $scope.plattar.toggleCamera(cameraEnabled);
        Tracker.track("ConfigButton:Clicked:cameraEnabled");
    };
}

function goFullscreen($scope, Tracker) {
    $scope.isFullscreen = false;
    $scope.goFullscreen = function() {
        // Calling parent requestFullscreen function
        $scope.requestFullscreen();
        $scope.isFullscreen = !$scope.isFullscreen;
        Tracker.track("ConfigButton:Clicked:goFullscreen");
    };
    document.onfullscreenchange = document.onwebkitfullscreenchange = document.onmozfullscreenchange = document.MSFullscreenChange = function(event) {
        $scope.isFullscreen = isFullscreen();
        $scope.$apply();
    };
}

function isFullscreen() {
    return Document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
}

function resetTransforms($scope, Tracker) {
    $scope.resetTransforms = function() {
        $scope.plattar.resetTransforms();
        Tracker.track("ConfigButton:Clicked:resetTransforms");
    };
}

function activateHelp($scope, $timeout, Tracker) {
    $scope.activateHelp = function(event) {
        $scope.helpActivated = true;
        Tracker.track("ConfigButton:Clicked:activateHelp");
        runHints($scope, $timeout);
    };
}

function helpListeners($scope) {
    //https://stackoverflow.com/questions/2381336/detect-click-into-iframe-using-javascript
    var mouseListener = window.addEventListener('blur', function(e) {
        if ($scope.helpActivated) {
            window.removeEventListener('blur', mouseListener);
            return;
        }
        if (document.activeElement === document.getElementById('plattar-frame')) {
            $scope.activateHelp();
        }
    });
    var touchListener = window.addEventListener('touchstart', function(e) {
        if ($scope.helpActivated) {
            window.removeEventListener('touchstart', touchListener);
            return;
        }
        if (document.activeElement === document.getElementById('plattar-frame')) {
            $scope.activateHelp();
        }
    });
}

function runHints($scope, $timeout) {
    var hintSettings = [{
            blocks: ['hideframe1', 'hideframe2', 'hideWalkthrough'],
            val: true,
            time: 0
        },
        {
            blocks: ['hideWalkthrough'],
            val: false,
            time: 0
        },
        {
            blocks: ['hideframe1'],
            val: false,
            time: 500
        },
        {
            blocks: ['hideframe1'],
            val: true,
            time: 3000
        },
        {
            blocks: ['hideframe2'],
            val: false,
            time: 3500
        },
        {
            blocks: ['hideframe2'],
            val: true,
            time: 6000
        },
        {
            blocks: ['hideWalkthrough'],
            val: true,
            time: 6500
        }
    ]
    hintSettings.forEach(function(setting) {
        $timeout(function() {
            setting.blocks.forEach(function(block) {
                $scope[block] = setting.val;
            });
        }, setting.time);
    });
}
