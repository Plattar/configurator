/*
	Controls the Panel that contains product details and variation selection
*/

angular.module('PlattarConfigurator')
.controller('configurator', ['$scope', 'config', 'Tracker',
	function($scope, config, Tracker) {
		$scope.error = undefined;

		$scope.plattar.api.getScene(config.sceneId,
			function (result) {
				$scope.scene = result;
				$scope.$apply();

				$scope.relationship = $scope.scene.attributes.custom_json.configurator;
			},
			function (error) {

				if(!config.sceneId){
					$scope.error = 'No scene specified to load.';
				}
				else if(error.status == 404){
					$scope.error = 'Your scene could not be found, please make sure your Scene ID exists.';
				}
				else{
					$scope.error = 'There was an error while loading this scene.';
				}
				$scope.plattar.onModalChange({
						title: 'Error',
						message: $scope.error,
						button: 'Understood',
						trackerError: 'Scene loading error'
				});
				// $('#errorModal').modal({});
				$scope.$apply();
			}
		);

		$scope.plattar.api.listProducts(config.sceneId, function (result) {
			$scope.products = result;
			resetPreview();
			applyPreview();
			$scope.$apply();
		});

		$scope.selectVariation = function (product, variation) {
			if(!variation.visiblePreview){
				return;
			}

			product.selectedVariation = variation;
			$scope.plattar.loadVariation(product.instanceid, variation.id);

			resetPreview();
			applyPreview();

			//Tracking variation.attributes.title or variation.id
			Tracker.track('Variation:Clicked:' + variation.id + ' ' + variation.attributes.title);
		};

		$scope.toggleVisibility = function () {
			$('.configurator-container').toggleClass('configurator-container-visible');
		};





		function resetPreview(){
			$scope.products.forEach(function(product){
				product.variations.forEach(function(variation){
					variation.visiblePreview = true;
				});
				product.visiblePreview = true;
			});
		}

		function applyPreview(){
			if(!$scope.relationship){
				return;
			}
			$scope.products.forEach(function(product){
				// Go through all the products and update the preview visibility
				if(product.selectedVariation){
					var obj = $scope.relationship[product.instanceid][product.selectedVariation.id];

					Object.keys(obj).forEach(function(productId){
						// get product by id
						var prod = $scope.products.find(function(product){
							return product.instanceid == productId;
						});

						// preventing sub-tier items blocking parent items
						if($scope.relationship[product.instanceid].level > $scope.relationship[productId].level){
							return;
						}

						// iterate through array
						obj[productId].forEach(function(variationId){
							// get variation by id
							var variation = prod.variations.find(function(variation){
								return variation.id == variationId;
							});
							// set visiblePreview to false
							variation.visiblePreview = false;

							if(prod.selectedVariation == variation){
								prod.selectedVariation = undefined;
								// hide variation
								$scope.plattar.loadVariation(prod.instanceid, null);
							}
						});
					});
				}
			});

			$scope.products.forEach(function(product){
				product.visiblePreview = false;
				product.variations.some(function(variation){
					if(variation.visiblePreview == true){
						product.visiblePreview = true;
						return true;
					}
				});
			});
		}
	}
]);
