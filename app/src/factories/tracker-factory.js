'use strict';

angular.module('PlattarConfigurator')
.factory('Tracker', ['config',
	function (config) {
		var tracker = {
			ready: false
		};

		var singleGA = false;
		var platformGA = false;
		var universalGA = false;

		tracker.init = function(options){
			/* Google analytics below */
			var scriptEl = document.createElement('script');
			scriptEl.setAttribute('async', 'true');
			scriptEl.setAttribute('src', 'https://www.google-analytics.com/analytics.js');
			// uncomment to enable developer mode
			// scriptEl.setAttribute('src', 'https://www.google-analytics.com/analytics_debug.js');
			document.head.appendChild(scriptEl);

			if(options.client_tracking_id){
				singleGA = true;
				ga('create', options.client_tracking_id, 'auto', 'clientTracker');
			}
			if(config.platformGA){
				platformGA = true;
				ga('create', config.platformGA, 'auto', 'platformTracker');

				ga('platformTracker.set', 'dimension1', options.id);
				ga('platformTracker.set', 'dimension2', options.title);
			}
			if(config.universalGA){
				universalGA = true;
				ga('create', config.universalGA, 'auto', 'universalTracker');
				ga('universalTracker.set', 'dimension1', options.id);
				ga('universalTracker.set', 'dimension2', options.title);
				ga('universalTracker.set', 'dimension3', 'Configurator');
			}

			tracker.ready = true;
		};

		tracker.pageview = function(path, title) {
			if (tracker.ready) {
				if (singleGA) {
					ga('clientTracker.set', 'page', path);
					ga('clientTracker.set', 'title', title);
					ga('clientTracker.send', 'pageview');
				}
				if (platformGA) {
					ga('platformTracker.set', 'page', path);
					ga('platformTracker.set', 'title', title);
					ga('platformTracker.send', 'pageview');
				}
				if (universalGA) {
					ga('universalTracker.set', 'page', path);
					ga('universalTracker.set', 'title', title);
					ga('universalTracker.send', 'pageview');
				}
			}
		}

		//Object Type:Action:Name of Specific scene/id of scene:
		tracker.track = function(eventName, data){
			if(!tracker.ready){
				return;
			}

			var eventArray = eventName.split(':');
			if(singleGA){
				ga('clientTracker.send', {
					hitType: 'event',
					eventCategory: eventArray[0],
					eventAction: eventArray[1],
					eventLabel: eventArray[2]
				});
			}
			if(platformGA){
				ga('platformTracker.send', {
					hitType: 'event',
					eventCategory: eventArray[0],
					eventAction: eventArray[1],
					eventLabel: eventArray[2]
				});
			}
			if(universalGA){
				ga('universalTracker.send', {
					hitType: 'event',
					eventCategory: eventArray[0],
					eventAction: eventArray[1],
					eventLabel: eventArray[2]
				});
			}
		}

		return tracker;
	}
]);
