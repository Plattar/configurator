/*
  Controls the annotations
*/

angular.module('PlattarConfigurator')
.controller('annotation', ['$scope', 'config', '$timeout', 'Tracker', '$rootScope',
  function($scope, config, $timeout, Tracker, $rootScope) {

    $scope.annotation = null;
    $scope.annotationactive = false;

    $rootScope.plattar.onAnnotationChange = function(annotationData) {
      $scope.annotation = annotationData;

      if (annotationData.file_id) {
        $scope.plattar.api.getFile(annotationData.file_id, function(result) {
          $timeout(function() {
            $scope.annotation.file = result.attributes.effective_uri;
            $scope.annotation.fileType = result.attributes.asset_type;
            $scope.annotationactive = true;
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
