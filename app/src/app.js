
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/* App Module */
angular.module('PlattarConfigurator', [])
.constant('config', {
	apiUrl: location.origin, // 'https://app.plattar.com'
	// sceneId: getParameterByName('sceneId') // getting sceneId from url
	// sceneId: '263577a8-fd44-4d8b-a0c6-e5d75ebc5272' // local test scene
	sceneId: 'f584ab37-c542-4536-9b63-dd41a167144a' // staging test scene
})
.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
	//this allows us to avoid CORS erros from these site
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		'https://dbtuhhzmxl35f.cloudfront.net/**',
		'https://**.cloudfront.net/**',
		]);
}])
/*.config([
	'$locationProvider', '$routeProvider',
	function ($locationProvider, $routeProvider) {
	$routeProvider
		.when('/verify/:token', {
			templateUrl: 'verify/verify.html',
			controller: 'verifyController',
			reloadOnSearch: false,
			title: 'Verifying Your Account'
		})
		.when('/dashboard', {
			templateUrl: 'dashboard/dashboard.html',
			controller: 'dashboardController',
			reloadOnSearch: false,
			tabName: 'dashboard',
			title: 'Dashboard'
		})
		.otherwise({
			redirectTo: '/dashboard'
		});

		$locationProvider.hashPrefix('');
	}
])*/
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

		$scope.requestFullscreen = function(){
			$scope.plattar.toggleFullscreen($element[0])
		};

		// Creates the connection to the iframe renderer
		angular.element(function () {
			$scope.plattar = new PlattarIntegration(config);

			var intv = $interval(function(){
				$scope.plattar.init(function(){
					$interval.cancel(intv);
					$scope.plattar.openScene(config.sceneId);
					$scope.loaded = true;
					$scope.$apply();
				});
			}, 250);
		});
	}
]);
