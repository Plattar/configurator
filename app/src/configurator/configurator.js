
angular.module('PlattarConfigurator')
.controller('configurator', ['$scope', 'config',
	function($scope, config) {
		// $scope.scene;
		// $scope.products;

		$scope.plattar.api.getScene(config.sceneId, function(result){
			$scope.scene = result;
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
]);
