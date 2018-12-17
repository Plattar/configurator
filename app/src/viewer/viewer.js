/*
	Controls the Panel that contains the controls and 3d view
*/

angular.module('PlattarConfigurator')
.controller('viewer', ['$scope', 'config', '$sce',
	function($scope, config, $sce) {
		$scope.embedUrl = $sce.trustAsResourceUrl(config.apiUrl + '/webgleditor/preview/index.html');
		$scope.isFullscreen = false;

		var cameraEnabled = false;
		$scope.toggleCamera = function(){
			cameraEnabled = !cameraEnabled;
			$scope.plattar.toggleCamera(cameraEnabled);
		};

		$scope.goFullscreen = function(){
			// Calling parent requestFullscreen function
			$scope.requestFullscreen();
			$scope.isFullscreen = !$scope.isFullscreen;
		};

		$scope.activateHelp = function(event){
			$scope.plattar.activateHelp();
		};

		$scope.resetTransforms = function(){
			$scope.plattar.resetTransforms();
		};

		function isFullscreen(){
			return Document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
		}
		document.onfullscreenchange = document.onwebkitfullscreenchange = document.onmozfullscreenchange = document.MSFullscreenChange = function ( event ) {
			$scope.isFullscreen = isFullscreen();
			$scope.$apply();
		};
	}
]);
