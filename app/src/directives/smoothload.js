
/*
	Directive to fade in images/thumbnails when they load, rather than load by chunks
*/

angular.module('PlattarConfigurator')
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