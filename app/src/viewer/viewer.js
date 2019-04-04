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
		$scope.isFullscreen = false;
		var cameraEnabled = false;

		$scope.toggleCamera = function() {
			cameraEnabled = !cameraEnabled;
			$scope.plattar.toggleCamera(cameraEnabled);
			Tracker.track("ConfigButton:Clicked:cameraEnabled");
		};

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
		function isFullscreen() {
			return Document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
		}

		$scope.resetTransforms = function() {
			$scope.plattar.resetTransforms();
			Tracker.track("ConfigButton:Clicked:resetTransforms");
		};

		$scope.activateHelp = function(event) {
			$scope.helpActivated = true;
			Tracker.track("ConfigButton:Clicked:activateHelp");
			var hintSettings = [{
					blocks: ['hideframe1', 'hideframe2', 'hideWalkthrough'],
					val: true,
					time: 0
				},{
					blocks: ['hideWalkthrough'],
					val: false,
					time: 0
				},{
					blocks: ['hideframe1'],
					val: false,
					time: 500
				},{
					blocks: ['hideframe1'],
					val: true,
					time: 3000
				},{
					blocks: ['hideframe2'],
					val: false,
					time: 3500
				},{
					blocks: ['hideframe2'],
					val: true,
					time: 6000
				},{
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
		};
	}
]);
