'use strict';
/*
	Controls the alert modal
*/

angular.module('PlattarConfigurator')
.controller('qrmodal', ['$scope', 'Tracker', '$rootScope', '$timeout', 'communicator',
	function ($scope, Tracker, $rootScope, $timeout, communicator) {
		communicator.injectObject('qrmodel', $scope);

		$rootScope.onQR = function(img) {
			$scope.img = img;
			$scope.modalOpen();
		};

		$scope.closeModal = function(){
			$('#qrmodal').modal('hide');
		};

		$scope.openModal = function(modalData){
			console.log('asdad')
			$scope.img = modalData.img;
			$('#qrmodal').modal({
				backdrop: 'static',
				keyboard: false
			});
		};
	}
]);
