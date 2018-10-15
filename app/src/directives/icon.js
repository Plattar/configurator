'use strict';

angular.module('PlattarConfigurator')
.directive('icon', function() {
	return {
		templateUrl: function(elem, attr) {
			if(!attr.src){
				elem.attr('src', attr['ng-src']);
				return 'icons/icon-blank.svg';
			}
			return attr.src;
		}
	}
});