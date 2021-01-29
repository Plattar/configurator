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
          var gltfFileman = products[0].selectedVariation.file.attributes.gltf_filename;
          var usdzFilename = products[0].selectedVariation.file.attributes.usdz_filename;

          this.injectedObjects["viewer"].setProduct({
            title: products[0].attributes.title,
            product_url: products[0].attributes.product_url,
            gltfUrl: config.cdnUrl + path + gltfFileman,
            usdzUrl: config.cdnUrl + path + usdzFilename
          });
        }
        else{
          this.injectedObjects["viewer"].setProduct();
        }

        // this.injectedObjects['main'].setHasVariations(hasVariations);
      },

      selectVariation: function(variation){
        if(!variation.file){
          return;
        }
        var path = variation.file.attributes.path;
        var filename = variation.file.attributes.original_filename;

        this.injectedObjects["viewer"].setVariation({
          gltfUrl: config.cdnUrl + path + filename,
          usdzUrl: config.cdnUrl + path + 'model-conv.usdz',
        });
      },

      injectObject: function(type, obj){
        this.injectedObjects[type] = obj;
      },

      sendMessage: function(destination, func, data){
        this.injectedObjects[destination][func](data);
      }
    }
  }
]);
