'use strict';

angular.module('PlattarConfigurator')
.directive('card', function() {
	return {
		scope: {
      data: '=',
    },
		templateUrl: '/page/card/card.html',
		controller: ['$parse', '$element', '$sce', '$scope', 'Colour', 'communicator', '$rootScope', 'config',
      function($parse, $element, $sce, $scope, Colour, communicator, $rootScope, config) {
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

        if($scope.card.data.type == 'cardslider'){
        	$scope.card.slides = [];

        	$rootScope.plattar.api.getCardSlider($scope.card.data.id, function(result){
        		if($scope.card.data.attributes.slider_type == 'page'){
							$scope.card.data.attributes.page_ids.forEach(function(id, index){
								var page = result.included.find(function(include){
									return include.id == id;
								});
								var file = result.included.find(function(include){
									return include.id == page.attributes.file_image_id;
								});

								page.file = file;
								page.file.attributes.effective_uri = config.cdnUrl + file.attributes.path + file.attributes.original_filename;

								$scope.card.slides[index] = page;
							});
        		}
        		else if($scope.card.data.attributes.slider_type == 'scene'){
							$scope.card.data.attributes.scene_ids.forEach(function(id, index){
								var scene = result.included.find(function(include){
									return include.id == id;
								});
								var file = result.included.find(function(include){
									return include.id == scene.attributes.file_image_id;
								});

								scene.file = file;
								scene.file.attributes.effective_uri = config.cdnUrl + file.attributes.path + file.attributes.original_filename;

								$scope.card.slides[index] = scene;
							});
        		}

        		$scope.$apply();
        	});
        }

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

        $scope.openPage = function(id){
			    communicator.sendMessage('pages', 'openPage', id);
        };

        $scope.openScene = function(id){
			    communicator.sendMessage('modelviewer', 'openScene', id);
        };

        $scope.click = function(){
        	if($scope.card.data.attributes.scene_link_id){
			    	$scope.openScene($scope.card.data.attributes.scene_link_id);
			    }

			    if($scope.card.data.attributes.page_link_id){
			    	$scope.openPage($scope.card.data.attributes.page_link_id);
			    }

			    // if its pointing to an external site
			    if($scope.card.data.attributes.url){
        		window.open($scope.card.data.attributes.url, '_blank');
			    }

			    $rootScope.plattar.sendMessageUpwards()
        };
    	}
    ]
	};
});