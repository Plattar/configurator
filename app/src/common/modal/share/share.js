'use strict';
/*
	Controls the share modal
*/

angular.module('PlattarConfigurator')
.controller('sharemodal', ['$scope', 'Tracker', '$rootScope', '$timeout', 'communicator',
	function ($scope, Tracker, $rootScope, $timeout, communicator) {
		communicator.injectObject('sharemodal', $scope);

		$rootScope.onQR = function(img) {
			$scope.img = img;
			$scope.modalOpen();
		};

		$scope.closeModal = function(){
			$('#sharemodal').modal('hide');
		};

		$scope.openModal = function(modalData){
			$scope.url = modalData.url;
			$scope.title = modalData.title;

			$('#sharemodal').modal({
				backdrop: 'static',
				keyboard: false
			});
		};
	}
]);
