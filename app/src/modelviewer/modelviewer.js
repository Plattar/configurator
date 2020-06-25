/*
	Controls the Panel that contains the controls and 3d view
*/
angular.module('PlattarConfigurator')
.controller('modelviewer', ['$scope', 'config', '$sce', 'Tracker', '$timeout', 'communicator',
	function($scope, config, $sce, Tracker, $timeout, communicator) {
		communicator.injectObject('modelviewer', $scope);

		$scope.modelUrl = '';
		$scope.visible = false;

		$scope.openModel = function(data){
			$scope.visible = true;

			$timeout(function(){
				$scope.modelUrl = $sce.trustAsResourceUrl(data.url);
			}, 500);
		};

		$scope.closeModel = function(){
			$scope.visible = false;

			$timeout(function(){
				$scope.modelUrl = $sce.trustAsResourceUrl('');
			}, 1000);
		};
	}
]);
