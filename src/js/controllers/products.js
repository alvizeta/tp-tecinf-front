(function(app) {


    app.service('ProductsServices', function ($resource) {


        var resource = $resource('/tec-inf-api/products', {}, {
            query: {
                method: 'GET',
                headers: [
                    {'Content-Type':'application/json'}],
                isArray: true
            },
            create: {
                method: 'POST'
            },

        });

        var resource2 = $resource('/tec-inf-api/products/:id',{}, {
            delete:{
                method: 'DELETE'
            },
            update: {
                method: 'PUT'
            },
        });

        this.getProducts = function getProducts(category){
            if(category){
                return resource.query({category: category}).$promise;
            }
            return resource.query({}).$promise;

        };
        this.createProduct = function createProduct(product){
            return resource.create(product).$promise;
        };
        this.deleteProductById = function deleteProductById(id){
            return resource2.delete({id: id});
        };
        this.updateProduct = function updateProduct(id, product){
            return resource2.update({id: id}, product).$promise;
        };
        this.getProductById = function getProductById(id){
            return resource2.get({id: id}).$promise;
        }

    });

    app.controller('ProductsController', function($scope, $resource, $state, $mdDialog, $rootScope, $mdToast, products, ProductsServices) {

        'use strict';

        $scope.showSimpleToast = function(text) {

            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .hideDelay(3000)
            );
        };

        $scope.category = 'all';

        $scope.$watch('category', function (newValue) {
            if(newValue === null || newValue === 'all'){
                ProductsServices.getProducts().then(function(data){
                    $scope.products = data;
                });
            }else {
                ProductsServices.getProducts(newValue).then(function(data){
                    $scope.products = data;
                });
            }

        });

        $scope.products = products;

        $scope.query = [];

        $scope.search = function (row) {
            var isIt = (angular.lowercase(row.name).indexOf(angular.lowercase($scope.query) || '') !== -1 ||
                angular.lowercase(row.category).indexOf(angular.lowercase($scope.query) || '') !== -1 ||
                angular.lowercase(row.price).indexOf(angular.lowercase($scope.query) || '') !== -1 );

            return isIt;
        };

        $scope.goTo = function goTo(productId) {
            $state.go('products.record', {subId: productId}, {reload:true});
        };

        $scope.goBack = function(){
            //$state.go('home');
        };

        $scope.$watch('query', function () {
            if($scope.query.length > 0) {
                $scope.query.toLowerCase();
            }
        });

        $scope.createNew = function (ev) {

            var product = {

                fechaCreacion: Date.now()
            };

            $scope.showDetails(ev, product);
        };

        $scope.showDetails = function (ev, product) {
            $mdDialog.show({
                templateUrl: 'partials/products.dialog.html',
                targetEvent: ev,
                clickOutsideToClose: false,
                controller: 'ProductsDialog',
                escapeToClose: true,
                locals: {product: product},
                focusOnOpen: true
            }).then(function (product) {

                ProductsServices.createProduct(product).then(function (data) {
                    ProductsServices.getProducts().then(function (data){
                        $scope.products = data;
                    })
                });

                $scope.showSimpleToast("Product Created");

            });

        };

    })

    .controller('ProductsDialog', function ($scope, $mdDialog, product) {

        $scope.products = product;

        $scope.saveProduct = function saveProduct() {
            $mdDialog.hide($scope.product);
        };

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

        $scope.canSave = function(){
            if($scope.product.name && $scope.product.price && $scope.product.category){
                return false;
            }
            return true;
        };

    })

    app.controller('ProductsRecordController', function($scope, $resource, $state, product, $stateParams, _, $mdToast, ProductsServices, fileReader) {

        'use strict';

        $scope.product = product;

        $scope.productOriginal = angular.copy($scope.product);

        $scope.$watch('product', function(newValue){
            if (!angular.equals(newValue, $scope.productOriginal)){
                $scope.allowedToSave = true;
            }else{
                $scope.allowedToSave = false;
            }
        }, true);

        $scope.$watch('productOriginal', function(newValue){
            if (!angular.equals(newValue, $scope.product)){
                $scope.allowedToSave = true;
            }else{
                $scope.allowedToSave = false;
            }
        }, true);

        $scope.showSimpleToast = function(text) {

            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .hideDelay(3000)
            );
        };

        $scope.goBack = function(){
            $state.go('products.list');
        };

        $scope.updateProduct = function (){
            ProductsServices.updateProduct($stateParams.subId, $scope.product).then(function (response) {
                $scope.product = response;
                $scope.productOriginal = angular.copy($scope.product);
            });
            $scope.showSimpleToast("Saved!");
        };

        //file reader stuff
        $scope.imageSrc = "";

        $scope.$on("fileProgress", function(e, progress) {
            $scope.progress = progress.loaded / progress.total;
        });

    });

    app.directive("ngFileSelect", function(fileReader, $timeout) {
        return {
            scope: {
                ngModel: '='
            },
            link: function($scope, el) {
                function getFile(file) {
                    fileReader.readAsDataUrl(file, $scope)
                        .then(function(result) {
                            $timeout(function() {
                                $scope.ngModel = result;
                            });
                        });
                }

                el.bind("change", function(e) {
                    var file = (e.srcElement || e.target).files[0];
                    getFile(file);
                });
            }
        };
    });

    app.factory("fileReader", function($q, $log) {
        var onLoad = function(reader, deferred, scope) {
            return function() {
                scope.$apply(function() {
                    deferred.resolve(reader.result);
                });
            };
        };

        var onError = function(reader, deferred, scope) {
            return function() {
                scope.$apply(function() {
                    deferred.reject(reader.result);
                });
            };
        };

        var onProgress = function(reader, scope) {
            return function(event) {
                scope.$broadcast("fileProgress", {
                    total: event.total,
                    loaded: event.loaded
                });
            };
        };

        var getReader = function(deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            reader.onprogress = onProgress(reader, scope);
            return reader;
        };

        var readAsDataURL = function(file, scope) {
            var deferred = $q.defer();

            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);

            return deferred.promise;
        };

        return {
            readAsDataUrl: readAsDataURL
        };
    });

})(tecinfapp);
