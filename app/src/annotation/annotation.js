/*
	Controls the annotations
*/

angular.module('PlattarConfigurator')
    .controller('annotation', ['$scope', 'config', '$timeout', 'Tracker',
        function($scope, config, $timeout, Tracker) {

            $scope.annotation = null;
            $scope.annotationactive = false;

            $scope.plattar.onAnnotationChange = function(annotationData) {
                $scope.annotation = annotationData;
                $scope.$digest();
            };

            $scope.$watch('annotation', function(annotationData) {
                if (!annotationData) {
                    return;
                }
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
                } else if (annotationData.text || annotationData.title) {
                    $timeout(function() {
                        $scope.annotation.title = annotationData.title;
                        $scope.annotation.text = annotationData.text;
                        $scope.annotationactive = true;
                    }, 0);
                }
            });
            $scope.clearAnnotation = function() {
              // if($scope.fileType == "video"){
              //   var video = document.getElementById("annotation-video");
              //   video.pause();
              // }
                $timeout(function() {
                    $scope.annotationactive = false;
                    $scope.annotation.title = undefined;
                    $scope.annotation.fileType = undefined;
                    $scope.annotation.file = undefined;
                    $scope.annotation.text = undefined;
                }, 500);
                $scope.plattar.closeAnnotation();
                //What about this??
                // bridge.sendMessage('tuiselectannotation', {});
                // this.events.publish('closeAnnotation');
            }
        }
    ]);
