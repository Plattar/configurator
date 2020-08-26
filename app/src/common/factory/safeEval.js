'use strict';

angular.module('PlattarConfigurator')
.factory('safeEval', ['memory', '$rootScope', 'communicator',
  function (memory, $rootScope, communicator) {
    var scripts = {};

    function safeEval(script, params) {
      var entity = params.entity;
      var bridge = {
        sendMessage: $rootScope.plattar.sendMessage
      };

      try{
        var F = new Function ('entity', 'memory', 'communicator', 'bridge', script.attributes.script);
        F(entity, memory, communicator, bridge);
      }
      catch(e){
        //If theres an error, log:
        // the error
        // script title/id
        // script last updated date
        // application id

        /*Sentry.configureScope((scope) => {
          scope.setExtra("title", script.attributes.title);
          scope.setExtra("date", script.attributes.updated_at);
          scope.setExtra("id", script.id);
          scope.setExtra("code", script.attributes.script);

          scope.setFingerprint([script.id]);
        });*/

        e.message = 'EventScript: ' + script.attributes.title + ' - ' + e.message;

        // Sentry.captureException(e);
        console.error(e);
      }
    }

    function get(id, cb){
      if (scripts[id]) {
        cb(scripts[id]);
      }

      $rootScope.plattar.api.getScriptEvent(id, function(entity){
        scripts[id] = entity;
        cb(entity);
      });
    }

    return function(ids, type, params){
      if(ids){
        ids.forEach(function(scriptId) {
          get(scriptId, function(script){
            if(script.attributes.event == type){
              safeEval(script, params);
            }
          });
        });
      }
    }

  }
]);
