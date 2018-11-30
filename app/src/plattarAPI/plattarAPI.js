
function PlattarIntegration(params){
	var params = params || {};
	if(params.apiUrl === undefined){
		params.apiUrl = 'https://app.plattar.com';
	}

	var apiUrl = params.apiUrl;
	var cdnUrl = params.cdnUrl;
	var iframe = document.querySelector('#plattar-frame');
	var self = this;

	this.onReady = function(){console.log('Not initialised properly')};
	this.onSceneChange = function(){console.log('No scene change listener set')};

	this.init = function(params, cb){
		this.onReady = cb;
		iframe = document.querySelector('#plattar-frame');

		if(params.apiUrl){
			apiUrl = params.apiUrl;
		}
		if(params.cdnUrl){
			cdnUrl = params.cdnUrl;
		}

		sendMessage('initpreview', {
			origin: location.origin,
			options: {
				autorotate: params.autorotate,
				helpslides: false,
			}
		});
	};

	function sendMessage(action, data){
		// make this timeout after 5 attempts
		if(!iframe) { // used to repeat the call if the iframe isn't ready yet
			setTimeout(function(){
				sendMessage(action, data);
			}, 500);
			return;
		}

		action = action.toLowerCase();
		if(iframe !== window){
			console.log('%c' + action, "background: #61ff61; color: #000; padding:4px 8px;", data);
			iframe.contentWindow.postMessage({eventName: action, data: data || {}}, apiUrl);
		}
	}

	window.addEventListener('message', function(e){
		console.log('%c' + e.data.eventName, "background: #6170ff; color: #000; padding:4px 8px;", e.data.data);
		var data = e.data.data;

		switch(e.data.eventName){
			case 'previewready':
				self.onReady();
				break;

			case 'openurl':
				if(e.data.data.url){
					window.open(data.url, '_blank');
				}
				break;

			case 'selectannotation':
				// Annotation has content to display
				if(data.title){
					// create annotation popup within the theme
				}
				// Annotation is linking to a website
				else if(data.url){
					// Open the website in a new tab
					window.open(data.url, '_blank');
				}
				// Annotation is linking to a different scene
				else if(data.scene_id){
					// Set config.sceneId to new sceneId
					config.sceneId = data.scene_id;
					// Open the new scene
					self.openScene(data.sceneId);
				}
				break;
		}
	});

	this.openScene = function(sceneId) {
		sendMessage('losescene', {
			// sceneId: sceneId
		});
		sendMessage('loadscene', {
			sceneId: sceneId
		});

		if(self.onSceneChange){
			self.onSceneChange(sceneId);
		}
	};

	this.loadVariation = function(productId, variationId) {
		sendMessage('loadproduct', {
			productId: productId,
			variationId: variationId
		});
	};

	this.toggleCamera = function(active) {
		sendMessage('toggleCamera', {active: active});
	};

	this.activateHelp = function() {
		sendMessage('activateHelp', {});
	};

	this.resetTransforms = function() {
		sendMessage('resetTransform', {} );
	};

	var isFullscreen = false;
	var storedCss = {};
	function goFullscreen(elem){
		if(elem){
			var docEl = window.document.documentElement;
			var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

			if(requestFullScreen){
				requestFullScreen.call(elem);
			}
			else{
				// iOS device fallback
				storedCss.position = $(elem).css('position');
				storedCss.top = $(elem).css('top');
				storedCss.left = $(elem).css('left');
				storedCss.bottom = $(elem).css('bottom');
				storedCss.right = $(elem).css('right');
				storedCss.height = $(elem).css('height');

				$(elem).css({
					position: 'fixed',
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					height: '100%'
				});
			}
		}
		else{
			sendMessage('goFullscreen', {} );
		}
		isFullscreen = true;
	}

	function exitFullscreen(elem){
		if(elem){
			// Cross-browser compatible code
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
			else{
				// iOS device fallback
				$(elem).css(storedCss);
			}
		}
		isFullscreen = false;
	}

	this.toggleFullscreen = function(elem){
		var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
		if(isFullscreen || fullscreenElement){
			exitFullscreen(elem);
		}
		else{
			goFullscreen(elem);
		}
	};

	this.api = {
		getScene: function(sceneId, successFunc, errorFunc) {
			$.get(apiUrl + '/api/v2/scene/'+sceneId, function(result){
				successFunc(result.data);
			})
			.fail(function(error){
				if(errorFunc){
					errorFunc(error);
				}
			});
		},

		listProducts: function(sceneId, successFunc, errorFunc) {
			$.get(apiUrl + '/api/v2/scene/'+sceneId+'?include=product,product.productvariation,product.productvariation.file,sceneproduct,sceneproduct.product,sceneproduct.product.productvariation,sceneproduct.product.productvariation.file', function(result){
				if(result.included && result.included.length){
					var products = result.included.filter(function(include){
						return (include.type == 'product' && include.attributes.scene_id == sceneId);
					})
					.map(function(product){
						product.instanceid = product.id;
						return product;
					});

					// This part is for product instances in a scene. Map them to product types for simplification
					var sceneproducts = result.included.filter(function(include){
						return include.type == 'sceneproduct';
					})
					.map(function(sceneproduct){
						var product = result.included.find(function(include){
							return sceneproduct.attributes.product_id == include.id;
						});
						//clone each product
						product = JSON.parse(JSON.stringify(product));
						//overwrite variables
						product.instanceid = sceneproduct.id;
						product.attributes.sort_order = sceneproduct.attributes.sort_order;
						product.attributes.title = sceneproduct.attributes.title;
						product.attributes.scene_id = sceneproduct.attributes.scene_id;
						return product;
					})
					.sort(function(a, b){
						return a.attributes.sort_order - b.attributes.sort_order;
					});

					//add to products array
					if(sceneproducts.length){
						products = products.concat(sceneproducts);
					}

					products.forEach(function(product){
						product.variations = result.included.filter(function(include){
							return include.type == 'productvariation' && (include.attributes.product_id == product.id);
						})
						.sort(function(a, b){
							return a.attributes.sort_order - b.attributes.sort_order;
						});

						product.variations.map(function(variation){
							var thumb;
							if(variation.attributes.swatch_id){
								thumb = result.included.find(function(include){
									return include.id == variation.attributes.swatch_id;
								});
							}
							else{
								thumb = result.included.find(function(include){
									return include.id == variation.attributes.file_id;
								});
							}
							if(thumb){
								variation.thumbnail = encodeURI(cdnUrl + thumb.attributes.path + thumb.attributes.thumbnail);
							}
							return variation;
						});

						product.selectedVariation = product.variations.find(function(variation){
							return variation.id == product.attributes.product_variation_id;
						});
					});

					successFunc(products);
				}
			})
			.fail(function(error){
				if(errorFunc){
					errorFunc(error);
				}
			});
		}
	};
}

window.plattarIntegration = new PlattarIntegration();