/*
	Controls the Panel that contains the controls and 3d view
*/
angular.module('PlattarConfigurator')
.controller('modelviewer', [
	'$scope', 'config', '$sce', 'Tracker', '$timeout', 'communicator', 'PlattarIntegration',
	function($scope, config, $sce, Tracker, $timeout, communicator, PlattarIntegration) {

		communicator.injectObject('modelviewer', $scope);

		$scope.modelUrl = '';
		$scope.visible = false;
		var url = config.apiUrl + '/webgleditor/preview/index.html';

		$scope.openScene = function(sceneId){
			$scope.visible = true;

			$scope.modelUrl = $sce.trustAsResourceUrl(url + '?sceneid='+sceneId);
			$scope.$apply();

			/*PlattarIntegration.init(sceneId,
				function(){
					$timeout(function(){
						$scope.modelUrl = $sce.trustAsResourceUrl(data.url);
					}, 100);
				}
			);*/

		};

		$scope.closeModel = function(){
			$scope.visible = false;

			$timeout(function(){
				$scope.modelUrl = $sce.trustAsResourceUrl('');
			}, 1000);
		};
	}
]);
