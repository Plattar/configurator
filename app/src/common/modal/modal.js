'use strict';
angular.module('PlattarConfigurator')
.controller('modalAlert', [
	'$scope', '$uibModalInstance',
	function ($scope, $uibModalInstance) {

		$scope.closeAlertModal = function () {
			close();
		};

		function close () {
			$uibModalInstance.close();
		};
	}
])
.factory('alert', ['$uibModal', '$rootScope',
	function($uibModal, $rootScope){

	var modals = [];

	return function(params) {
		var scope = $rootScope.$new();

		// Prevents duplicate modals
		if(modals.find(function(modal){
			return modal.title == params.title
		})){
			return;
		}

		scope.title = params.title;
		scope.message = params.text || params.message;
		scope.image = params.image;
		scope.button = !params.hideButton ? (params.button || 'ok') : false;

		scope.customFunction = params.customFunction || function(){};

		var modal = $uibModal.open({
			size: 'md',
			animation: true,
			templateUrl: '/common/modal/modal.html',
			controller: 'modalAlert',
			scope: scope,
			backdrop: params.backdrop || true,
			keyboard: params.keyboard || true
		});
		modal.title = scope.title;

		modals.push(modal);
		modal.result.then(function(){
			modals.splice(modals.indexOf(modal));
		},function(){
			modals.splice(modals.indexOf(modal));
		});

		return modal;
	};
}]);
