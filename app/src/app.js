
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

function webglCompatible(cb) {
	try {
		var canvas = document.createElement('canvas');
		var gl = (window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
		if (gl == null) {
			throw new Error('WebGL not supported.');
		}
	}
	catch (e) {
		cb({
			title: 'Unsupported System.',
			message: 'It appears your web browser does not support the features required to run our editor. Please visit http://get.webgl.org/ for more information.',
			trackerError: 'WebGL Failed'
		});
		return false;
	}
	return true;
}

// Used for development
var isProd = function () {
	return location.hostname == 'app.plattar.com';
}

var isProd2 = function () {
	return location.hostname == 'app2.plattar.com';
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
	universalGA: "UA-86801112-11",
	sceneId: getParameterByName('sceneId'), // getting sceneId from url
	autorotate: getParameterByName('autorotate') || true // setting if the scene should automatically rotate on load
})*/

.constant('config', {
	apiUrl: isProd() ? 'https://app.plattar.com' : isProd2() ? 'https://app2.plattar.com' : 'https://staging.plattar.space',
	cdnUrl: isProd() ? 'https://cdn.plattar.com/' : isProd2() ? 'https://cdn.plattar.com/' : 'https://cdn-staging.plattar.space/',
	platformGA: isProd() ? "UA-86801112-10" : '',
	universalGA: isProd() ? "UA-86801112-12" : '',
	sceneId: getParameterByName('sceneId'), // getting sceneId from url
	autorotate: getParameterByName('autorotate') || true // setting if the scene should automatically rotate on load
})

.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
	//this allows us to avoid CORS erros from these site
	$sceDelegateProvider.resourceUrlWhitelist([
		'self'
		]);
}])
.controller('mainController',
	['$scope', '$element', '$interval', '$http', 'config', 'Tracker', '$rootScope', 'communicator',
	function($scope, $element, $interval, $http, config, Tracker, $rootScope, communicator) {

		$scope.loaded = false;
		$scope.sceneId = config.sceneId;
		$scope.setHasVariations = false;
		communicator.injectObject('main', $scope);

		$scope.setHasVariations = function(hasVariations) {
			$scope.hasVariations = hasVariations;
		};

		$scope.requestFullscreen = function() {
			$scope.plattar.toggleFullscreen($element[0]);
		};

		// Creates the connection to the iframe renderer
		angular.element(function () {
			// Creating the Plattar engine/api link
			$rootScope.plattar = $scope.plattar = window.plattarIntegration;

			// Setting up a callback for when the scene changes
			$scope.plattar.onSceneChange = function(sceneId){
				if(sceneId && config.sceneId != sceneId){
					$scope.sceneId = undefined;
					// $scope.$apply();

					config.sceneId = sceneId;
					$scope.sceneId = sceneId;
				}
				// $scope.$apply();
			};

			//handling tracker events from window postMessage
			$scope.plattar.onTrackData = function(trackingData) {
				Tracker.track(trackingData);
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
					if (!webglCompatible($scope.plattar.onModalChange)) {
							return;
					}
				});
			}
		});

		//calling tracker
		$http.get(config.apiUrl + '/api/v2/scene/' + config.sceneId)
		.then(function(scene){
			config.appId = scene.data.data.attributes.application_id;
			$http.get(config.apiUrl + '/api/v2/application/' + config.appId)
			.then(function(app){
				if(app.data.data.attributes.google_analytics_token){
					Tracker.init({
						id: app.data.data.id,
						title: app.data.data.attributes.title,
						client_tracking_id: app.data.data.attributes.google_analytics_token
					});
				}
				else {
					Tracker.init({
						id: app.data.data.id,
						title: app.data.data.attributes.title
					});
				}
				Tracker.track("Scene:Loaded:" + config.sceneId + ' - ' + scene.data.data.attributes.title);
				Tracker.pageview('scene/' + scene.data.data.id, scene.data.data.attributes.title);
			});
		});
	}
]);

window.mobilecheck = function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};
