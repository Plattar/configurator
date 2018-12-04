
angular.module('PlattarConfigurator')
.controller('configurator', ['$scope', 'config',
	function($scope, config) {
		// $scope.scene;
		// $scope.products;
		$scope.error = undefined;

		$scope.plattar.api.getScene(config.sceneId, function(result){
			$scope.scene = result;
			$scope.$apply();
		}, function(error){

			if(!config.sceneId){
				$scope.error = 'No scene specified to load.';
			}
			else if(error.status == 404){
				$scope.error = 'Your scene could not be found, please make sure your Scene ID exists.';
			}
			else{
				$scope.error = 'There was an error while loading this scene.';
			}
			$('#exampleModal').modal({})
			$scope.$apply();
		});

		$scope.plattar.api.listProducts(config.sceneId, function(result){
			$scope.products = result;
			$scope.$apply();
		});

		$scope.selectVariation = function(product, variation){
			product.selectedVariation = variation;
			$scope.plattar.loadVariation(product.instanceid, variation.id);
		};

		$scope.toggleVisibility = function(){
			$('.configurator-container').toggleClass('configurator-container-visible');
		};
	}
])
.controller('modalNotify', [
	'$scope', '$uibModalInstance',
	function ($scope, $uibModalInstance) {
	}
])
