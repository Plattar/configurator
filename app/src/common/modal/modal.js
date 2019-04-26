'use strict';
/*
	Controls the alert modal
*/

angular.module('PlattarConfigurator')
.controller('modalAlert', ['$scope', 'Tracker', '$rootScope','$timeout',
	function ($scope, Tracker, $rootScope, $timeout) {
		$scope.modal = null;

		$rootScope.plattar.onModalChange = function(modalData) {
			$scope.modal = modalData;
			$scope.modalOpen(modalData);
		};

		$scope.modalClose = function(){
			$scope.modal = undefined;
		};

		$scope.modalOpen = function(modalData){
			$scope.title = modalData.title;
			$scope.message = modalData.message;
			$scope.button = !modalData.hideButton ? (modalData.button || 'ok') : false;
			$('#modal').modal({
				backdrop: modalData.backdrop || 'static',
				keyboard: modalData.keyboard || false
			});
			Tracker.track(modalData.trackerError);
		};
	}
]);
