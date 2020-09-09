'use strict';

angular.module('PlattarConfigurator')
.factory('memory', [
  function () {

    var memory = {
      ready: false
    };

    if(!memory.ready){
      init();
    }

    function init(){
      // initialise persist vars
      var persist = localStorage.getItem('plattarpersist');
      if(persist){
        persist = JSON.parse(persist);
      }
      else{
        persist = {};
      }
      localStorage.setItem('plattarpersist', JSON.stringify(persist));

      // initialise session vars
      localStorage.setItem('plattarsession', '{}');
      memory.ready = true;
      console.log('initialising memory');
    }

    memory.get = function(key){
      var persist = JSON.parse(localStorage.getItem('plattarpersist'));
      if(persist.hasOwnProperty(key)){
        return persist[key];
      }

      var session = JSON.parse(localStorage.getItem('plattarsession'));
      if(session.hasOwnProperty(key)){
        return session[key];
      }

      return '';
    };

    memory.store = function(key, value){
      var session = JSON.parse(localStorage.getItem('plattarsession'));
      session[key] = value;
      localStorage.setItem('plattarsession', JSON.stringify(session));
    };

    memory.persist = function(key, value){
      var persist = JSON.parse(localStorage.getItem('plattarpersist'));
      persist[key] = value;
      localStorage.setItem('plattarpersist', JSON.stringify(persist));
    };

    memory.clear = function(){
      localStorage.setItem('plattarsession', '{}');
      localStorage.setItem('plattarpersist', '{}');
    };

    return memory;
  }
]);
