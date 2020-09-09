/*
  Controls the annotations
*/

angular.module('PlattarConfigurator')
.controller('annotation', [
  '$scope', 'config', '$timeout', 'Tracker', '$rootScope', '$sce', 'communicator',
  function($scope, config, $timeout, Tracker, $rootScope, $sce, communicator) {

    communicator.injectObject('annotation', $scope);

    $rootScope.plattar.onAnnotationChange = function(annotationData) {
      $scope.handleAnnotation(annotationData);
    };

    $scope.annotation = null;
    $scope.annotationactive = false;

    $scope.handleAnnotation = function(data) {
      if(data.page_link_id){
        communicator.sendMessage('pages', 'closeAllPages', {});
        communicator.sendMessage('pages', 'openPage', data.page_link_id);
      }
      if(data.url){
        // Open the website in a new tab
        window.open(data.url, '_blank');
      }
      // Annotation is linking to a different scene
      if(data.scene_link_id){
        // Open the new scene
        communicator.sendMessage('modelviewer', 'openScene', data.scene_link_id);
      }
      if(data.file_video_id || data.file_image_id || data.text){
        $scope.openAnnotation(data);
      }
    };

    $scope.openAnnotation = function(annotationData) {
      $scope.annotation = annotationData;

      if($scope.annotation.url){
        $scope.annotation.url = $sce.trustAsResourceUrl(annotationData.url);
      }

      $timeout(function() {
        if (annotationData.file_video_id) {
          $scope.plattar.api.getFile(annotationData.file_video_id, 'filevideo', function(result) {
            $scope.annotation.file = result.attributes.effective_uri;
            $scope.annotation.fileType = result.type;
            $scope.annotationactive = true;
            $scope.$apply();
          }, function(error) {
            console.log(error);
          });
        }
        else if (annotationData.file_image_id && annotationData.type != 'button') {
          $scope.plattar.api.getFile(annotationData.file_image_id, 'fileimage', function(result) {
            $scope.annotation.file = result.attributes.effective_uri;
            $scope.annotation.fileType = result.type;
            $scope.annotationactive = true;
            $scope.$apply();
          }, function(error) {
            console.log(error);
          });
        }
        else if (annotationData.text && annotationData.type != 'button') {
          $scope.annotation.title = annotationData.title;
          $scope.annotation.text = annotationData.text;
          $scope.annotationactive = true;
        }
        else if(annotationData.url){
          // $scope.annotation.url = $sce.trustAsResourceUrl(annotationData.url);
          $scope.annotationactive = true;
        }
      }, 0);
    };

    $scope.clearAnnotation = function() {
      $scope.annotationactive = false;
      $timeout(function() {
        $scope.annotation.title = undefined;
        $scope.annotation.fileType = undefined;
        $scope.annotation.file = undefined;
        $scope.annotation.text = undefined;
      }, 300);
      $scope.plattar.closeAnnotation();

      $scope.plattar.sendMessage('pantocamera', {title:'start camera'})
    }
  }
]);
