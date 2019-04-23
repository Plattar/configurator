'use strict';
/*
	Controls the alert modal
*/

angular.module('PlattarConfigurator')
.controller('modalAlert', ['$scope', 'Tracker', '$rootScope','$timeout',
	function ($scope, Tracker, $rootScope, $timeout) {
		$scope.modal = null;
		$scope.modalActive = false;
		$rootScope.plattar.onModalChange = function(modalData) {
			$scope.modal = modalData;
		};
		$scope.$watch('modal', function(modalData) {
			if(!modalData){
				return;
			}
			$scope.modalOpen(modalData);
		});
		$scope.modalClose = function(){
			$scope.modalActive = false;
		}
		$scope.modalOpen = function(modalData){
			$scope.modalActive = true;
			$scope.title = modalData.title;
			$scope.message = modalData.message;
			$scope.button = !modalData.hideButton ? (modalData.button || 'ok') : false;
			$('#modal').modal({
				backdrop: modalData.backdrop || 'static',
				keyboard: modalData.keyboard || false
			});
			Tracker.track(modalData.trackerError);
		}
	}
]);
