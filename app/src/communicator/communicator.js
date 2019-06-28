'use strict';

angular.module('PlattarConfigurator')
.factory('communicator', ['config',
	function(config) {
    return {
      isProduct: false,
      title: "",
      product_url: "",
      usdzUrl: "",
      gltfUrl: "",
      injectedObjects: {},
      setData: function(products){
        this.isProduct = (products.length == 1) ? true : false;
        this.injectedObjects["viewer"].isProduct = this.isProduct;
  			if(this.isProduct){
  				var path = products[0].selectedVariation.file.attributes.path;
  				var filename = products[0].selectedVariation.file.attributes.filename;
  				this.title = products[0].attributes.title;
  				this.product_url = products[0].attributes.product_url;
          this.gltfUrl = config.cdnUrl + path + filename;
          this.usdzUrl = config.cdnUrl + path + 'model-conv.usdz';
  			}
      },
      selectVariation: function(variation){
        var path = variation.file.attributes.path;
        var filename = variation.file.attributes.filename;
        this.gltfUrl = config.cdnUrl + path + filename;
        this.usdzUrl = config.cdnUrl + path + 'model-conv.usdz';
      },
      injectObject: function(type, obj){
        this.injectedObjects[type] = obj;
      }
    }
  }
]);
