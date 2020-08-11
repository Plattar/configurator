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
		var timeout;

		$scope.openScene = function(sceneId){
			if(timeout){
				$timeout.cancel(timeout);
			}

			$scope.visible = true;

			$timeout(function(){
				$scope.modelUrl = $sce.trustAsResourceUrl(url + '?sceneid='+sceneId);
			});

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

			timeout = $timeout(function(){
				$scope.modelUrl = $sce.trustAsResourceUrl('');
			}, 1000);
		};
	}
]);
