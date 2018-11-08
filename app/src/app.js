
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var isProd = () => {
  return location.hostname == 'app.plattar.com' || location.hostname == 'd189usitq2l7i3.cloudfront.net';
}

var isStaging = () => {
  return location.hostname == 'staging.plattar.space' || location.hostname == 'cdn-staging.plattar.space';
}

var isDev = () => {
  return !isProd() && !isStaging();
}

/* App Module */
angular.module('PlattarConfigurator', [])

//production
.constant('config', {
	apiUrl: location.origin,
	cdnUrl: isProd() ? 'https://cdn.plattar.com/' : isStaging() ? 'https://cdn-staging.plattar.space/' : 'https://cdn-dev.plattar.space/',
	sceneId: getParameterByName('sceneId') // getting sceneId from url
})

//staging
/*.constant('config', {
	apiUrl: location.origin,
	cdnUrl: 'https://cdn-staging.plattar.space/',
	sceneId: 'f584ab37-c542-4536-9b63-dd41a167144a' // staging test scene
})*/

// local
/*.constant('config', {
	apiUrl: location.origin,
	cdnUrl: 'https://cdn-dev.plattar.space/',
	// sceneId: '6f5ef36c-4fe4-4633-bc69-1f481b4783d9' // local test scene
	sceneId: '263577a8-fd44-4d8b-a0c6-e5d75ebc5272' // local test scene
})*/

.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
	//this allows us to avoid CORS erros from these site
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		'https://dbtuhhzmxl35f.cloudfront.net/**',
		'https://**.cloudfront.net/**',
		]);
}])
/*.config(['$uibTooltipProvider',
	function ($uibTooltipProvider) {
		$uibTooltipProvider.options({
			container: 'body'
		});
	}]
)*/
.run(['config',
	function (config) {
		// Check for a sceneId in the url includes, and ovverride config's sceneId if so
	}
])
.controller('mainController', ['$scope', '$element', '$interval', 'config',
	function($scope, $element, $interval, config) {

		$scope.loaded = false;
		$scope.sceneId = config.sceneId;

		$scope.requestFullscreen = function(){
			$scope.plattar.toggleFullscreen($element[0])
		};

		// Creates the connection to the iframe renderer
		angular.element(function () {
			$scope.plattar = window.plattarIntegration;
			$scope.plattar.onSceneChange = function(sceneId){
				if(sceneId && config.sceneId != sceneId){
					$scope.sceneId = undefined;
					$scope.$apply();

					config.sceneId = sceneId;
					$scope.sceneId = sceneId;
				}
				$scope.$apply();
			};

			var intv = $interval(function(){
				$scope.plattar.init(config, function(){
					$interval.cancel(intv);
					if(config.sceneId){
						$scope.plattar.openScene(config.sceneId);
					}
					$scope.loaded = true;
					$scope.$apply();
				});
			}, 250);
		});
	}
]);
