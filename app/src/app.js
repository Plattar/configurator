
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  url = url.toLocaleLowerCase();
  name = name.toLocaleLowerCase();
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Used for development
var isProd = function () {
  return location.hostname == 'app.plattar.com';
}

var isStaging = function () {
  return location.hostname == 'staging.plattar.space';
}

var isDev = function () {
  return !isProd() && !isStaging();
}

/* App Module */
angular.module('PlattarConfigurator', [])
/*.constant('config', {
	origin: location.origin,
	apiUrl: 'https://localhost',
	cdnUrl: isProd() ? 'https://cdn.plattar.com/' : isStaging() ? 'https://cdn-staging.plattar.space/' : 'https://cdn-dev.plattar.space/',
	sceneId: getParameterByName('sceneId'), // getting sceneId from url
	autorotate: getParameterByName('autorotate') || true // setting if the scene should automatically rotate on load
})*/

.constant('config', {
	apiUrl: isProd() ? 'https://app.plattar.com' : 'https://staging.plattar.space',
	cdnUrl: isProd() ? 'https://cdn.plattar.com/' : 'https://cdn-staging.plattar.space/',
	sceneId: getParameterByName('sceneId'), // getting sceneId from url
	autorotate: getParameterByName('autorotate') || true // setting if the scene should automatically rotate on load
})

.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
	//this allows us to avoid CORS erros from these site
	$sceDelegateProvider.resourceUrlWhitelist([
		'self'
		]);
}])
.controller('mainController', ['$scope', '$element', '$interval', 'config',
	function($scope, $element, $interval, config) {

		$scope.loaded = false;
		$scope.sceneId = config.sceneId;

		$scope.requestFullscreen = function() {
			$scope.plattar.toggleFullscreen($element[0])
		};

		// Creates the connection to the iframe renderer
		angular.element(function () {
			// Creating the Plattar engine/api link
			$scope.plattar = window.plattarIntegration;

			// Setting up a callback for when the scene changes
			$scope.plattar.onSceneChange = function(sceneId){
				if(sceneId && config.sceneId != sceneId){
					$scope.sceneId = undefined;
					$scope.$apply();

					config.sceneId = sceneId;
					$scope.sceneId = sceneId;
				}
				$scope.$apply();
			};

			// Initialising the project. Set up in a loop for if loading is slow/fails
			var intv = $interval(doit, 500);
			function doit(){
				$scope.plattar.init(config, function(){
					$interval.cancel(intv);
					if(config.sceneId){
						$scope.plattar.openScene(config.sceneId);
					}
					$scope.loaded = true;
					$scope.$apply();
				});
			}
		});
	}
]);
