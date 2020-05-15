/*
  Controls the annotations
*/

angular.module('PlattarConfigurator')
.controller('annotation', ['$scope', 'config', '$timeout', 'Tracker', '$rootScope', '$sce',
  function($scope, config, $timeout, Tracker, $rootScope, $sce) {

    $scope.annotation = null;
    $scope.annotationactive = false;

    $rootScope.plattar.onAnnotationChange = function(annotationData) {
      $scope.annotation = annotationData;

      if (annotationData.file_video_id) {
        $scope.plattar.api.getFile(annotationData.file_video_id, 'filevideo', function(result) {
          $timeout(function() {
            $scope.annotation.file = result.attributes.effective_uri;
            $scope.annotation.fileType = result.type;
            $scope.annotationactive = true;
          }, 0);
        }, function(error) {
          console.log(error);
        });
      }
      else if (annotationData.file_image_id) {
        $scope.plattar.api.getFile(annotationData.file_image_id, 'fileimage', function(result) {
          $timeout(function() {
            $scope.annotation.file = result.attributes.effective_uri;
            $scope.annotation.fileType = result.type;
            $scope.annotationactive = true;
            console.log($scope.annotation)
          }, 0);
        }, function(error) {
          console.log(error);
        });
      }
      else if (annotationData.text || annotationData.title) {
        $timeout(function() {
          $scope.annotation.title = annotationData.title;
          $scope.annotation.text = annotationData.text;
          $scope.annotationactive = true;
        }, 0);
      }
      else if(annotationData.url){
        $timeout(function() {
          $scope.annotation.url = $sce.trustAsResourceUrl(annotationData.url);
          $scope.annotationactive = true;
        }, 0);
      }
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
