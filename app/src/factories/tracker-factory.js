'use strict';

angular.module('PlattarConfigurator')
.factory('Tracker', ['config', function (config) {
	var ga = window.ga;
	var tracker = {
		ready: false
	};

  var singleGA = false;
  var universalGA = false;

  var universal_ga_id = null;
  var single_ga_id = null;

	tracker.init = function(options){
    tracker.ready = true;
    if(options.ga_tracking_id){
      single_ga_id = options.ga_tracking_id;
      singleGA = true;
      ga('create', options.ga_tracking_id, 'auto');
    }
    if(config.universalGA){
      universal_ga_id = config.universalGA;
      universalGA = true;
      ga('create', universal_ga_id, 'auto', 'universalClientTracker');
      tracker.pageview('initialising');
    }
	};

  tracker.pageview = function(pageId) {
    if (tracker.ready) {
      if (singleGA) {
        ga('send', 'pageview', '/' + pageId);
      }
      if (universalGA) {
        ga('universalClientTracker.send', 'pageview', '/' + pageId);
      }
    }
  }

	tracker.setUserData = function(data){
		if(!tracker.ready){
			return;
		}
	};

  //Object Type:Action:Name of Specific scene/id of scene:
	tracker.track = function(eventName, data){
		if(!tracker.ready){
			return;
		}

		checkGALoaded(function(){
			var eventArray = eventName.split(':');
      if(singleGA){
        ga('send', 'event', eventArray[0], eventArray[1], eventArray[2]);
      }
      if(universalGA){
        ga('universalClientTracker.send', 'event', eventArray[0], eventArray[1], eventArray[2]);
      }
		});
	}

	function checkGALoaded(cb, attempt){
		// Preventing infinitely stacking setTimeouts for performance
		if(!attempt){
			attempt = 0;
		}
		else if(attempt > 10){
			console.warn('Failed to find google analytics');
			return;
		}

		ga = window.ga;
		if(ga){
			cb(ga);
		}
		else{
			setTimeout(checkGALoaded, 500, cb, ++attempt);
		}
	}

	return tracker;
}]);
