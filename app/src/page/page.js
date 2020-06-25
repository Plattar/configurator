/*
	Controls the Panel that contains product details and variation selection
*/

angular.module('PlattarConfigurator')
.controller('pageController', [
	'$scope', 'config', 'Tracker', 'communicator', 'PlattarIntegration', '$rootScope', '$sce',
	function($scope, config, Tracker, communicator, PlattarIntegration, $rootScope, $sce) {
		$scope.error = undefined;
		$scope.visible = false;

		$scope.page = 'directory';
		$scope.pillowImage = './img/pillow1.png';

		communicator.injectObject('pages', $scope);

		$scope.canAugment = PlattarIntegration.canAugment;

    $rootScope.plattar.onAnnotationChange = function(annotationData) {
    	switch(annotationData.id){
    		// Stove Top
    		case "795dd00d-55f8-1e4f-5530-2514b36e790b":
					PlattarIntegration.init('347f6610-ac70-11ea-99df-c54013504faf',
						function(){}
					);
					$scope.openPage('cooktop');
    			break;

    		// Pillow
    		case "84565bc0-a52e-11ea-8de7-751179282923":
					PlattarIntegration.init('bb3d7f10-ae98-11ea-b8dd-27658cb4e6fe', 'bb40d760-ae98-11ea-bac5-9f1d917175ea',
						function(){}
					);
					$scope.openPage('pillow');
    			break;

    		// Shelf
    		case "99752dc0-aab6-11ea-acc8-8f34b9024c67":
					PlattarIntegration.init('d5c98a50-5e71-11ea-a8b2-3dca52c88ef4', 'd5cd6610-5e71-11ea-b74a-2be39ab16879',
						function(){
						}
					);
					$scope.openPage('shelf');
    			break;

    		default:
					communicator.sendMessage('annotation', 'openAnnotation', annotationData);
    			break;
    	}
			$scope.$apply();
		};

		$scope.toggleVisibility = function(){
			$scope.visible = !$scope.visible;
		};

		$scope.closePage = function(){
			$scope.visible = false;
			communicator.sendMessage('modelviewer', 'closeModel', {});
			$scope.plattar.closeAnnotation();
		};

		$scope.openPage = function(page){
			$scope.page = page || 'directory';
			$scope.visible = true;
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

		$scope.open3D = function(){
			communicator.sendMessage('modelviewer', 'openModel', {url: PlattarIntegration.embedUrl});
		};

		$scope.selectPanorama = function(panoramaId){
			$scope.plattar.selectPanorama(panoramaId);
			$scope.closePage();
		};

		$scope.openYoutube = function(panoramaId){
			communicator.sendMessage('annotation', 'openAnnotation', {
				url: 'https://www.youtube.com/embed/9W46ks8hMdg'
			});
		};
	}
]);
