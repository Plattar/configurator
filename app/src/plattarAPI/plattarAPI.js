
/*
	Standalone API and 3d engine iframe integration
*/

function PlattarApiIntegration(params){
	var params = params || {};
	if(params.apiUrl === undefined){
		params.apiUrl = 'https://app.plattar.com';
	}

	var parentWindow = {
		source: undefined,
		origin: undefined
	};

	var apiUrl = params.apiUrl;
	var cdnUrl = params.cdnUrl;
	var environment = params.environment;
	var iframe = document.querySelector('#plattar-frame');
	var self = this;
	this.debug = false;
	this.showAnnotation = false;
	this.onReady = function(){console.log('Not initialised properly')};
	this.onSceneChange = function(){console.log('No scene change listener set')};
	// Function calls to the Plattar API to get scene/product data
	var server = Plattar.Server.default();
	server.origin(server[environment || 'prod']);

	this.init = function(params, cb){
		this.onReady = cb;
		iframe = document.querySelector('#plattar-frame');

		if(params.apiUrl){
			apiUrl = params.apiUrl;
		}
		if(params.cdnUrl){
			cdnUrl = params.cdnUrl;
		}
		if(params.environment){
			environment = params.environment;
			server.origin(server[environment]);
		}

		sendMessage('initpreview', {
			origin: location.origin,
			options: {
				autorotate: params.autorotate,
				reverseRotation: params.reverseRotation,
				isConfigurator: true
			}
		});
	};

	// Sennding messages to the 3d Engine
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
			if(self.debug){
				console.log('%c' + action, "background: #61ff61; color: #000; padding:4px 8px;", data);
			}
			iframe.contentWindow.postMessage({eventName: action, data: data || {}}, apiUrl);
		}
	}
	this.sendMessage = sendMessage;

	function sendMessageUpwards(action, data, count) {
		var count = count || 0;
		var data = data || {};
		if (!parentWindow || !parentWindow.source) {
			if (count < 5) {
				setTimeout(function () {
					count++;
					sendMessage(action, data, count);
				}, 500);
			}
			return;
		}

		action = action.toLowerCase();
		if (parentWindow !== window && parentWindow.source) {
			parentWindow.source.postMessage({ eventName: action, data: data }, parentWindow.origin);
		}
	}
	this.sendMessageUpwards = sendMessageUpwards;

	// Receiving messages from the 3d engine
	window.addEventListener('message', function(e){
		if(self.debug){
			console.log('%c' + e.data.eventName, "background: #6170ff; color: #000; padding:4px 8px;", e.data.data);
		}
		var data = e.data.data;

		switch(e.data.eventName){
			case 'setup':
				parentWindow = {
					source: event.source,
					origin: event.origin
				};
				sendMessageUpwards('setupconfirm', {});
				break;

			case 'previewready':
				self.onReady();
				break;

			case 'analyticstracker':
				self.onTrackData(e.data.data.eventString);
				break;

			case 'pressbutton':
				if(data.type == 'scenemodel' || data.type == 'scenebutton'){
					data.attributes.type = 'button';
				}
				self.onAnnotationChange(data.attributes);
				break;

			case 'openurl':
				if(e.data.data.url){
					// window.open(data.url, '_blank');
					self.onAnnotationChange({
						url: data.url
					});
				}
				break;

			case 'setLoading':
				if(e.data.data && self.onLoaded){
					self.onLoaded(data);
				}
				break;

			case 'selectannotation':
				// Annotation has content to display
				self.onAnnotationChange(data);

				/*if(data.url){
					// Open the website in a new tab
					window.open(data.url, '_blank');
				}
				// Annotation is linking to a different scene
				else if(data.scene_id){
					// Open the new scene
					self.openScene(data.scene_id);
				}*/
				break;
		}
	});

	// Used for opening a new scene
	this.openScene = function(sceneId) {
		//Lose the existing scene if there is one, and load the new scene
		sendMessage('losescene', {});
		sendMessage('loadscene', {
			sceneId: sceneId
		});

		//Callback function to reload variation UI when the scene is changed
		if(self.onSceneChange){
			self.onSceneChange(sceneId);
		}
	};

	// Used to set a variation for a product
	this.loadVariation = function(productId, variationId) {
		sendMessage('loadproduct', {
			productId: productId,
			variationId: variationId
		});
	};

	// Turns the camera view on/off as the background of the scene
	this.toggleCamera = function(active) {
		sendMessage('toggleCamera', {active: active});
	};

	this.panToCamera = function(id) {
		sendMessage('panToCamera', {id: id});
	};

	// Enables the help prompts to appear
	this.activateHelp = function() {
		sendMessage('activateHelp', {});
	};

	// Returns the product back to its original position/rotation
	this.resetTransforms = function() {
		sendMessage('resetTransform', {} );
	};

	this.closeAnnotation = function() {
		// sendMessage('tuiselectannotation', {});
		sendMessage('clearannotation', {});
	};

	this.setAnnotation = function(data) {
		// sendMessage('tuisetannotation', {});
		sendMessage('setannotation', {id: data.id});
	};

	this.displayAnnotation = function(data) {
		sendMessage('displayannotation', data);
	};

	this.displayMeasurements = function(data) {
		sendMessage('displaymeasurements', data);
	};

	this.selectPanorama = function(panoramaId) {
		sendMessage('runscript', {
			script: "PLATTAR.Actions.selectPanorama(params.id);PLATTAR.eventHandler.send('tui,cms', 'panToCamera', {id: params.id,time: 2000,rotation: false,pivot: 'self'});",
			params: {
				id: panoramaId
			}
		});
	};

	// Cross-browser compatible fullscreen enabling
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

	// Cross-browser compatible fullscreen exiting
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

	// Toggles the fullscreen state
	this.toggleFullscreen = function(elem){
		var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
		if(isFullscreen || fullscreenElement){
			exitFullscreen(elem);
		}
		else{
			goFullscreen(elem);
		}
	};

	function clone(object){
		var obj = JSON.parse(JSON.stringify(object));
		obj.index = Math.random();
		return obj;
	}

	this.api = {
		getFile: function(fileId, fileType, successFunc, errorFunc) {
			var factory;
			switch(fileType){
				case 'fileimage':
					factory = new Plattar.FileImage(fileId);
					break;
				case 'filemodel':
					factory = new Plattar.FileModel(fileId);
					break;
				case 'filevideo':
					factory = new Plattar.FileVideo(fileId);
					break;
				case 'fileaudio':
					factory = new Plattar.FileAudio(fileId);
					break;
			}

			factory.get().then(function(result){
				result.attributes.effective_uri = cdnUrl + result.attributes.path + result.attributes.original_filename;
				successFunc(result);
			})
			.catch(errorFunc);
		},

		getScene: function(sceneId, successFunc, errorFunc) {
			var scene = new Plattar.Scene(sceneId);
			scene.get()
			.then(successFunc)
			.catch(errorFunc);
		},

		listCameras: function(sceneId, successFunc, errorFunc) {
			var scene = new Plattar.Scene(sceneId);
			scene.include(Plattar.SceneCamera, Plattar.SceneCamera.include(Plattar.FileImage));

			scene.get()
			.then(function(result){
				var cameras = result.relationships.filter(Plattar.SceneCamera)
				.sort(function(a, b){
					return a.attributes.sort_order - b.attributes.sort_order;
				});
				cameras.forEach(function(camera){
					camera.image = camera.relationships.find(Plattar.FileImage, camera.attributes.file_image_id);
				});
				successFunc(cameras);
			})
			.catch(errorFunc);
		},

		listAnnotations: function(sceneId, successFunc, errorFunc) {
			var scene = new Plattar.Scene(sceneId);
			scene.include(Plattar.SceneAnnotation);

			scene.get()
			.then(function(result){
				var annotations = result.relationships.filter(Plattar.SceneAnnotation);
				successFunc(annotations);
			})
			.catch(errorFunc);
		},

		getScriptEvent: function(scriptEventId, successFunc, errorFunc) {
			var script = new Plattar.ScriptEvent(scriptEventId);
			script.get()
			.then(successFunc)
			.catch(errorFunc);
		},

		getPage: function(pageId, successFunc, errorFunc) {
			var page = new Plattar.Page(pageId);
			page.include(Plattar.CardTitle, Plattar.CardParagraph, Plattar.CardImage, Plattar.CardButton, Plattar.CardIFrame, Plattar.CardRow, Plattar.CardYoutube, Plattar.CardVideo, Plattar.CardHTML, Plattar.CardSlider, Plattar.CardMap);

			page.get()
			.then(function(result){
				page.cards = page.relationships.filter(Plattar.CardObject)
				.sort(function(a, b){
					return a.attributes.sort_order - b.attributes.sort_order;
				});

				successFunc(result);
			})
			.catch(errorFunc);
		},

		getCardSlider: function(id, successFunc, errorFunc) {
			var cardSlider = new Plattar.CardSlider(id);
			cardSlider.include(Plattar.Page.include(Plattar.FileImage), Plattar.Scene.include(Plattar.FileImage));

			cardSlider.get()
			.then(successFunc)
			.catch(errorFunc);
		},

		listProducts: function(sceneId, successFunc, errorFunc) {
			var scene = new Plattar.Scene(sceneId);
			scene.include(Plattar.Product.include(Plattar.ProductVariation.include(Plattar.FileModel)));
			scene.include(Plattar.Product.include(Plattar.ProductVariation.include(Plattar.FileImage)));
			scene.include(Plattar.SceneProduct.include(Plattar.Product.include(Plattar.ProductVariation.include(Plattar.FileModel))));
			scene.include(Plattar.SceneProduct.include(Plattar.Product.include(Plattar.ProductVariation.include(Plattar.FileImage))));

			scene.get()
			.then(function(result){
				var products = result.relationships.filter(Plattar.Product);
				products.forEach(function(product){
					product.instanceid = product.id;
				});

				var sceneProducts = result.relationships.filter(Plattar.SceneProduct)
				.map(function(sceneProduct){
					var product = sceneProduct.relationships.find(Plattar.Product);
					product.instanceid = sceneProduct.id;
					product.attributes.sort_order = sceneProduct.attributes.sort_order;
					product.attributes.title = sceneProduct.attributes.title;
					product.attributes.scene_id = sceneProduct.attributes.scene_id;

					return product;
				});

				if(sceneProducts.length){
					products = products.concat(sceneProducts);
				}

				products.forEach(function(product){
					product.variations = product.relationships.filter(Plattar.ProductVariation)
					.sort(function(a, b){
						return a.attributes.sort_order - b.attributes.sort_order;
					})
					.map(function(variation){
						var swatch;
						if(variation.attributes.swatch_id){
							swatch = variation.relationships.find(Plattar.FileImage, variation.attributes.swatch_id);
							if(!swatch.attributes.thumbnail){
								swatch.attributes.thumbnail = swatch.attributes.original_filename;
							}
							variation.swatch = encodeURI(cdnUrl + swatch.attributes.path + swatch.attributes.thumbnail);
						}

						var thumb = variation.relationships.find(Plattar.FileModel, variation.attributes.file_model_id);
						if(thumb){
							variation.thumbnail = encodeURI(cdnUrl + thumb.attributes.path + thumb.attributes.thumbnail);
							/*if(!swatch){
								variation.swatch = variation.thumbnail;
							}*/
						}
						variation.file = thumb;
						return variation;
					});

					product.selectedVariation = product.relationships.find(Plattar.ProductVariation, product.attributes.product_variation_id);
				});

				products = products.sort(function(a, b){
					return a.attributes.sort_order - b.attributes.sort_order;
				});

				successFunc(products);
			})
			.catch(errorFunc);
		}
	};
}

window.PlattarApiIntegration = new PlattarApiIntegration();
