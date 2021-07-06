/*
	Controls the Panel that contains product details and variation selection
*/

angular.module('PlattarConfigurator')
.controller('configurator', [
	'$scope', 'config', 'Tracker', 'communicator', 'PlattarIntegration', '$rootScope', '$sce', '$rootScope',
	'$timeout',
	function($scope, config, Tracker, communicator, PlattarIntegration, $rootScope, $sce, $rootScope,
		$timeout) {
		$scope.error = undefined;
		communicator.injectObject('configurator', $scope);

		$scope.hasVariations = false;
		$rootScope.configuratorVisible = false;

		$scope.canAugment = PlattarIntegration.canAugment;

		$scope.listHeight = function(){
			if($scope.products){
				return 200+Math.max(0, (document.body.offsetHeight-275)-$scope.products.length*144);
			}
			return 0;
		}

		var loaded = false;
		$scope.plattar.onLoaded = function(params){
			if(params.loading === false && !loaded){
				applyPreview();
			}
		};

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
					$timeout(function(){
						if(!$scope.isMobile){
							$scope.toggleVisibility();
						}
					}, 500)
					return true;
				}
			});

			var url = new URL(location.href);
			if(url.searchParams.get('conf')){
				var conf = atob(url.searchParams.get('conf'));
				console.log(url.searchParams.get('conf'))
				console.log(conf)
				conf.split('-').forEach(function(pair){
					pair = pair.split(':');
					var productslug = pair[0];
					var variationslug = pair[1];
					var product = $scope.products.find(function(product){
						return product.id.indexOf(productslug) != -1;
					});
					if(!product){
						return;
					}
					var variation = product.variations.find(function(variation){
						return variation.id.indexOf(variationslug) != -1;
					});
					if(!variation){
						return;
					}

					console.log(productslug, variationslug);
					console.log(product.id, variation.id)
					$scope.selectVariation(product, variation);
				});
			}

			$scope.$apply();
		});

		$scope.toggleExpanded = function(product){
			product.collapsed = !product.collapsed;
		};

		$scope.selectVariation = function (product, variation) {
			if(product.selectedVariation == variation){
				return;
			}
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

		$scope.scrollTo = function(event){
			var el = event.currentTarget;
			// el.parentElement.parentElement.parentElement.scrollTo({left: el.offsetLeft-8});

			$(el.parentElement.parentElement.parentElement).animate({
				scrollLeft: el.offsetLeft-8
			}, 300);
		};

		$scope.toggleVisibility = function (thing) {
			if(thing == 'view'){
				communicator.sendMessage('viewer', 'toggleVisibility');
				$rootScope.configuratorVisible = false;
			}
			else{
				$rootScope.configuratorVisible = !$rootScope.configuratorVisible;
			}
		};

		$scope.openAR = function(){
			if(PlattarIntegration.canAugment){

			}
			else{
				// show qr code
				communicator.sendMessage('qrmodal', 'openModal', {img: PlattarIntegration.qrUrl});
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

							if(!prod.selectedVariation){
								$scope.plattar.loadVariation(prod.instanceid, null);
							}
							else if(prod.selectedVariation == variation){
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

		$scope.share = function(){
			// create a slug that describes this variation selection
			var slug = '';
			$scope.products.forEach(function(product){
				if(product && product.selectedVariation){
					if(slug != ''){
						slug += '-';
					}
					slug += product.id.split('-').pop() + ':' + product.selectedVariation.id.split('-').pop();
				}
			});

			slug = btoa(slug);

			var url = new URL(location.href);
			if(url.searchParams.has('conf')){
				url.searchParams.delete('conf');
			}
			url.searchParams.append('conf', slug);

			if(navigator.canShare && navigator.canShare()){
				navigator.share({
					url: url.href,
					title: $scope.scene.attributes.title
				});
			}
			else{
				communicator.sendMessage('sharemodal', 'openModal', {
					url: url.href,
					title: $scope.scene.attributes.title,
				});
			}
		};
	}
]);
