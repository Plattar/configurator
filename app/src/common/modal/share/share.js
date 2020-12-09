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

		$scope.copyLink = function(event){
      event.target.select();
      try {
        document.execCommand('copy');
      }
      catch (err) {
      }
		};

		$scope.openModal = function(modalData){
			// $scope.url = modalData.url;
			$scope.title = modalData.title;

			var b64 = btoa(modalData.url);
      var url = 'https://c.plattar.space/api/v2/shorten?base64='+b64;
      $.get(url, function(result){
        $scope.url = result;
        $scope.$apply();
      });

			$('#sharemodal').modal({
				backdrop: 'static',
				keyboard: false
			});
		};
	}
]);
