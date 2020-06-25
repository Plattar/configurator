/*
  Controls the annotations
*/

angular.module('PlattarConfigurator')
.controller('annotation', [
  '$scope', 'config', '$timeout', 'Tracker', '$rootScope', '$sce', 'communicator',
  function($scope, config, $timeout, Tracker, $rootScope, $sce, communicator) {

    communicator.injectObject('annotation', $scope);

    $scope.annotation = null;
    $scope.annotationactive = false;

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
          }, function(error) {
            console.log(error);
          });
        }
        else if (annotationData.file_image_id) {
          $scope.plattar.api.getFile(annotationData.file_image_id, 'fileimage', function(result) {
            $scope.annotation.file = result.attributes.effective_uri;
            $scope.annotation.fileType = result.type;
            $scope.annotationactive = true;
          }, function(error) {
            console.log(error);
          });
        }
        else if (annotationData.text || annotationData.title) {
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
    }
  }
]);
