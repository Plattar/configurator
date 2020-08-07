/*
	Controls the Panel that contains product details and variation selection
*/

angular.module('PlattarConfigurator')
.controller('pageController', [
	'$scope', 'config', 'Tracker', 'communicator', 'PlattarIntegration', '$rootScope', '$sce',
	'$timeout', 'Colour',
	function($scope, config, Tracker, communicator, PlattarIntegration, $rootScope, $sce,
		$timeout, Colour) {
		$scope.error = undefined;
		$scope.visible = false;

		$scope.pages = [];

		communicator.injectObject('pages', $scope);

		$scope.canAugment = PlattarIntegration.canAugment;

		$scope.toggleVisibility = function(){
			$scope.visible = !$scope.visible;

			if($scope.visible){
				$scope.openPage('35ca5bb0-ca34-11ea-bc57-75c5caae240d');
			}
			else{
				//remove all pages
			}
		};

		$scope.openPage = function(pageid){
			$scope.visible = true;

			$rootScope.plattar.api.getPage(pageid, function(page){
				$scope.pages.push(page);
				page.index = Math.random();

				if(page.data.attributes.background_color){
					var colour = new Colour(page.data.attributes.background_color);
					if(colour.isDark(200)){
						page.data.attributes.text_color = 'rgb(255, 255, 255)';
					}
					else{
						page.data.attributes.text_color = 'rgb(0, 0, 0)';
					}
				}
				else{
					page.data.attributes.background_color = 'rgb(255, 255, 255)';
					page.data.attributes.text_color = 'rgb(0, 0, 0)';
				}

				page.background = {};
				if(page.data.attributes.background_image_id){
					$rootScope.plattar.api.getFile(page.data.attributes.background_image_id, 'fileimage', function(image){
						$timeout(function(){
							page.background = image;
						});
					});
				}

				$scope.$apply();
				$timeout(function(){
					page.visible = true;
				},10);
			});
		};

		$scope.closeAllPages = function(){
			$scope.pages.forEach(function(page){
				$scope.closePage(page);
			});
		};

		$scope.closePage = function(page){
			page.visible = false;

			// remove page from stack
			$timeout(function(){
				$scope.pages.splice($scope.pages.indexOf(page), 1);
				if(!$scope.pages.length){
					$scope.visible = false;
				}
			}, 500)
		};

		$scope.openAR = function(){
			if(PlattarIntegration.canAugment){
				PlattarIntegration.startAugment();
			}
			else{
				// show qr code
				communicator.sendMessage('qrmodel', 'openModal', {img: PlattarIntegration.qrUrl});
			}
		};

		/*
		// move to card
		$scope.open3D = function(){
			communicator.sendMessage('modelviewer', 'openModel', {url: PlattarIntegration.embedUrl});
		};*/

		/*$scope.selectPanorama = function(panoramaId){
			$scope.plattar.selectPanorama(panoramaId);
			$scope.closePage();
		};*/

		/*$scope.openYoutube = function(panoramaId){
			communicator.sendMessage('annotation', 'openAnnotation', {
				url: 'https://www.youtube.com/embed/9W46ks8hMdg'
			});
		};*/
	}
]);
