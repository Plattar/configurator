/*
	Controls the Panel that contains the controls and 3d view
*/
angular.module('PlattarConfigurator')
.controller('viewer', ['$scope', 'config', '$sce', 'Tracker', '$timeout', 'communicator', '$rootScope',
	function($scope, config, $sce, Tracker, $timeout, communicator, $rootScope) {

		var canQuicklook = (function() {
			var tempAnchor = document.createElement('a');

			return tempAnchor.relList && tempAnchor.relList.supports &&
					tempAnchor.relList.supports('ar');
		})();

		communicator.injectObject('viewer', $scope);

		$scope.embedUrl = $sce.trustAsResourceUrl(config.apiUrl + '/webgleditor/preview/index.html?allowAR=false');
		$scope.hideWalkthrough = true;
		$scope.hideframe1 = true;
		$scope.hideframe2 = true;
		$scope.clickType = !mobilecheck();
		$scope.isFullscreen = false;
		$scope.showAR = false;
		var cameraEnabled = false;
		$scope.product = undefined;
		$rootScope.controlsVisible = false;
		$rootScope.controlsAvailable = false;
		$timeout(function(){
			$rootScope.controlsVisible = !$scope.isMobile;
		}, 500);
		$scope.annotationsVisible = true;
		$scope.selectedAnnotation = true;
		$scope.inPresentation = false;

		$scope.selectedCamera = undefined;
		$scope.cameras = undefined;
		setTimeout(function(){
			$scope.plattar.api.listCameras(config.sceneId, function(cameras){
				$scope.selectedCamera = cameras[0];
				$scope.cameras = cameras;
				if($scope.cameras.length > 0){
					$rootScope.controlsAvailable = true;
				}
				$scope.$apply();
			});

			$scope.plattar.api.listAnnotations(config.sceneId, function(annotations){
				$scope.annotations = annotations;
				if($scope.annotations.length > 0){
					$rootScope.controlsAvailable = true;
				}
				$scope.$apply();
			});
		},1000);

		if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
			$scope.showAR = true;
		}
		else if(/android/i.test(navigator.userAgent)){
			$scope.showAR = true;
		}

		$scope.panToCamera = function(camera){
			$scope.plattar.panToCamera(camera.id);
			$scope.selectedCamera = camera;
		};

		$scope.toggleVisibility = function(thing){
			if(thing == 'configure'){
				communicator.sendMessage('configurator', 'toggleVisibility');
				$rootScope.controlsVisible = false;
			}
			else{
				$rootScope.controlsVisible = !$rootScope.controlsVisible;
			}
		};

		$scope.playPresentation = function(){
			$scope.inPresentation = true;
			$scope.nextAnnotation(0);

			/*$scope.cameras.forEach(function(camera, count){
				$timeout(function(){
					var annotation = $scope.annotations.find(function(annotation){
						return annotation.attributes.scene_camera_id == camera.id;
					});
					$scope.plattar.panToCamera(camera.id);
					if(annotation){
						$scope.openAnnotation(annotation);
						$scope.plattar.setAnnotation($scope.selectedAnnotation);
					}
				}, 4000*count);
			});*/
		};

		$scope.openAnnotation = function(data){
			$scope.selectedAnnotation = $scope.annotations.find(function(annotation){
				return annotation.id == data.id;
			});
		};

		$scope.nextAnnotation = function(indexSet){
			var index;
			if(indexSet !== undefined){
				index = indexSet;
			}
			if(!$scope.selectedAnnotation){
				index = 0;
			}
			else{
				index = $scope.annotations.indexOf($scope.selectedAnnotation);
				index ++;
			}

			if(index >= $scope.annotations.length){
				index = 0;
			}

			$scope.openAnnotation($scope.annotations[index]);
			$scope.plattar.setAnnotation($scope.selectedAnnotation);
		};

		$scope.toggleCamera = function() {
			//detect ios

			if(cameraEnabled || !$scope.product){
				cameraFallback();
			}
			else if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
				// If it can load quicklook and has a usdz file, open quicklook
				if(canQuicklook){
					var anchor = document.createElement('a');
					anchor.setAttribute('rel', 'ar');
					anchor.appendChild(document.createElement('img'));
					anchor.setAttribute('href', $scope.product.usdzUrl);
					anchor.click();
				}
				// else fall back to showing the camera view
				else{
					cameraFallback();
				}
			}
			//detect android
			else if(/android/i.test(navigator.userAgent)){
				var gltf = new URL($scope.product.gltfUrl);
				var link = encodeURIComponent($scope.product.product_url);
				var title = encodeURIComponent($scope.product.title);
				var scheme = 'https';

				gltf.protocol = 'intent://';

				intent = gltf;
				intent += '?link=' + link;
				intent += '&title=' + title;
				intent += '#Intent;scheme=' + scheme;
				intent += ';package=com.google.ar.core;action=android.intent.action.VIEW;';
				intent += ';end;';//'S.browser_fallback_url='+link+

				// anchor.setAttribute('href', intent);
				// anchor.click();
				window.open(intent);
				var timeout = setTimeout(function(){
					cameraFallback();
				}, 250);

				document.addEventListener("visibilitychange", function() {
					clearTimeout(timeout);
				});
			}
		};

		function cameraFallback(){
			cameraEnabled = !cameraEnabled;
			try{
				$scope.plattar.toggleCamera(cameraEnabled);
				Tracker.track("ConfigButton:Clicked:cameraEnabled");
			}
			catch(e){
				$scope.plattar.onModalChange({
					title: 'Error',
					message: "There was an error loading your camera.",
					button: 'Understood',
					trackerError: "Camera Click Error"
				});
			}
		}

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

		$scope.helpListeners = function() {
			//https://stackoverflow.com/questions/2381336/detect-click-into-iframe-using-javascript
			/*var mouseListener = window.addEventListener('blur', function(e) {
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
			});*/
		}

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
			}];

			hintSettings.forEach(function(setting) {
				$timeout(function() {
					setting.blocks.forEach(function(block) {
						$scope[block] = setting.val;
					});
				}, setting.time);
			});
		};

		$scope.setProduct = function(product) {
			$scope.product = product;
		};

		$scope.toggleAnnotations = function(){
			$scope.annotationsVisible = !$scope.annotationsVisible;

			if($scope.annotationsVisible){
				$scope.plattar.displayAnnotation({display: true});
			}
			else{
				$scope.plattar.displayAnnotation({display: false});
			}
		};

		$scope.setVariation = function(variation) {
			if($scope.product){
				$scope.product.gltfUrl = variation.gltfUrl;
				$scope.product.usdzUrl = variation.usdzUrl;
			}
		};

		$scope.helpListeners();
	}
]);
