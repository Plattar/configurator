'use strict';

angular.module('PlattarConfigurator')
.directive('card', function() {
	return {
		scope: {
      data: '=',
    },
		templateUrl: '/page/card/card.html',
		controller: ['$parse', '$element', '$sce', '$scope', 'Colour', 'communicator', '$rootScope',
      function($parse, $element, $sce, $scope, Colour, communicator, $rootScope) {
        $scope.card = {
        	data: $scope.data
        };

        if($scope.card.data.attributes.color){
          var colour = new Colour($scope.card.data.attributes.color);
          if(colour.isDark(200)){
            $scope.card.data.attributes.text_color = 'rgb(255, 255, 255)';
          }
          else{
            $scope.card.data.attributes.text_color = 'rgb(0, 0, 0)';
          }
        }
        else{
          $scope.card.data.attributes.background_color = 'rgb(255, 255, 255)';
          $scope.card.data.attributes.text_color = 'rgb(0, 0, 0)';
        }

        ['file_image', 'file_video', 'file_audio', 'file_model'].forEach(function(filetype){
          if($scope.card.data.attributes[filetype+'_id']){
            $rootScope.plattar.api.getFile(
            	$scope.card.data.attributes[filetype+'_id'],
              filetype.replace('_', ''),
	            function(result){
	            	$scope.card[filetype] = result;
	              $scope.$apply();

	              console.log('File:', result);
	            }
	          )
          }
      	});


        $scope.getAsTrusted = function(url){
					if(url){
						return $sce.trustAsResourceUrl(url.valueOf());
					}
        };

        $scope.getAsHtml = function(html){
					if(html){
						return $sce.trustAsHtml(html);
					}
        };

        $scope.click = function(){
        	if($scope.card.data.attributes.scene_link_id){
						communicator.sendMessage('modelviewer', 'openScene', $scope.card.data.attributes.scene_link_id);
			      // this.events.publish('openScene', $scope.card.data.attributes.scene_link_id);
			    }

			    if($scope.card.data.attributes.page_link_id){
			      // this.events.publish('openPage', $scope.card.data.attributes.page_link_id);
			      communicator.sendMessage('pages', 'openPage', $scope.card.data.attributes.page_link_id);
			    }

			    // if its pointing to an external site
			    if($scope.card.data.attributes.url){
			      bridge.sendMessage('tuiopenexternalurl', {url: $scope.card.data.attributes.url});
			    }
        };
    	}
    ]
	};
});