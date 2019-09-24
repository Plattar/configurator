'use strict';

angular.module('PlattarConfigurator')
.factory('communicator', ['config',
  function(config) {
    return {
      injectedObjects: {},

      setData: function(products){
        var isProduct = (products.length == 1) ? true : false;
        // this.injectedObjects["viewer"].isProduct = this.isProduct;

        if(isProduct){
          var path = products[0].selectedVariation.file.attributes.path;
          var filename = products[0].selectedVariation.file.attributes.original_filename;

          this.injectedObjects["viewer"].setProduct({
            title: products[0].attributes.title,
            product_url: products[0].attributes.product_url,
            gltfUrl: config.cdnUrl + path + filename,
            usdzUrl: config.cdnUrl + path + 'model-conv.usdz',
          });
        }
        else{
          this.injectedObjects["viewer"].setProduct();
        }
      },

      selectVariation: function(variation){
        var path = variation.file.attributes.path;
        var filename = variation.file.attributes.original_filename;

        this.injectedObjects["viewer"].setVariation({
          gltfUrl: config.cdnUrl + path + filename,
          usdzUrl: config.cdnUrl + path + 'model-conv.usdz',
        });
      },

      injectObject: function(type, obj){
        this.injectedObjects[type] = obj;
      }
    }
  }
]);
