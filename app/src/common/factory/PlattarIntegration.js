'use strict';

angular.module('PlattarConfigurator')
.factory('PlattarIntegration', function () {
	var PlattarIntegration = window.PlattarIntegration;
	window.PlattarIntegration = undefined;

	return new PlattarIntegration();
});
