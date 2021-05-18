'use strict';

angular.module('PlattarConfigurator')
.directive('ngSceneId', [
  '$sce',
  function($sce){
    return {
      priority: 99, // it needs to run after the attributes are interpolated
      link: function(scope, element, attr) {
        var name = 'scene-id';

        // We need to sanitize the url at least once, in case it is a constant
        // non-interpolated attribute.
        attr.$set('ngSceneId', $sce.getTrustedMediaUrl(attr.ngSceneId));

        attr.$observe('ngSceneId', function(value) {
          attr.$set(name, value);
        });
      }
    };
  }
]);
