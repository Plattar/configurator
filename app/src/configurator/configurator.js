/*
	Controls the Panel that contains product details and variation selection
*/

angular.module('PlattarConfigurator')
.controller('configurator', [
	'$scope', 'config', 'Tracker', 'communicator', 'PlattarIntegration', '$rootScope', '$sce',
	function($scope, config, Tracker, communicator, PlattarIntegration, $rootScope, $sce) {
		$scope.error = undefined;
		communicator.injectObject('configurator', $scope);

		$scope.hasVariations = false;

		$scope.canAugment = PlattarIntegration.canAugment;

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
				$scope.$apply();
			}
		);

		$scope.plattar.api.listProducts(config.sceneId, function (result) {
			communicator.setData(result);
			$scope.products = result;
			resetPreview();
			applyPreview();

			$scope.hasVariations = false;
      $scope.products.some(function(product){
        if(product.variations.length > 1){
					$scope.hasVariations = true;
          return true;
        }
      });

			$scope.$apply();
		});

		$scope.selectVariation = function (product, variation) {
			if(!variation.visiblePreview){
				return;
			}

			product.selectedVariation = variation;
			communicator.selectVariation(variation);
			resetPreview();
			applyPreview();

			//Tracking variation.attributes.title or variation.id
			Tracker.track('Variation:Clicked:' + variation.id + ' ' + variation.attributes.title);

			//load the variations
			// loadVariations();
			$scope.plattar.loadVariation(product.instanceid, product.selectedVariation.id);
		};

		$scope.toggleVisibility = function () {
			$('.configurator-container').toggleClass('configurator-container-visible');
		};

		$scope.openAR = function(){
			if(PlattarIntegration.canAugment){

			}
			else{
				// show qr code
				communicator.sendMessage('qrmodel', 'openModal', {img: PlattarIntegration.qrUrl});
			}
		};

		$scope.open3D = function(){
			communicator.sendMessage('modelviewer', 'openModel', {url: PlattarIntegration.embedUrl});
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
			var iterate = false;
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

				//here set the product variation
				var isVisible = product.variations.filter(function(v){
					return v.visiblePreview;
				}).length > 0;
				if(!product.selectedVariation && isVisible){
					product.selectedVariation = product.variations.find(function(variation){
						return variation.visiblePreview;
					});
					if(product.selectedVariation){
						$scope.plattar.loadVariation(product.instanceid, product.selectedVariation.id);
					}
					else{
						$scope.plattar.loadVariation(product.instanceid, null);
					}
				}
			});

			//hide variation if it is in relationship of other product's selected variations.
			$scope.products.forEach(function(product){
				var oldSelectedVariation = product.selectedVariation;
				$scope.products.forEach(function(prod){
					var pid = prod.instanceid;
					var selectedVariation = prod.selectedVariation;

					if(!selectedVariation){
						return;
					}
					if($scope.relationship[pid].level >= $scope.relationship[product.instanceid].level){
						return;
					}

					var hideVarIds = $scope.relationship[pid][selectedVariation.id];
					if(hideVarIds[product.instanceid]){
						hideVarIds[product.instanceid].forEach(function(vid){
							var variation = product.variations.find(function(v){
								return v.id == vid;
							});
							variation.visiblePreview = false;
							if(oldSelectedVariation == variation){
								// hide variation
								$scope.plattar.loadVariation(product.instanceid, null);
								iterate = true;
							}
						});
					}
				});
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

			if(iterate){
				applyPreview();
			}
		}
	}
]);
