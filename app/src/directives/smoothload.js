
angular.module('PlattarEmbed')
.directive('img', function() {
	return {
		restrict: 'E',
		scope: true,
		controller: ['$scope', '$element',
			function($scope, $element){
				$element.addClass('smoothload');
				$element.addClass('smoothload-out');
				$element.on('load', function(){
					$element.removeClass('smoothload-out');
				});
			}
		]
	}
})