var tecinfapp = angular.module('tecinfapp', ['ngMaterial', 'ngAnimate', 'ngMessages', 'ngAria', 'ui.router', 'md.data.table',
    'ngResource', 'md.time.picker']);

(function(app) {

    app.constant('_',
        window._
    );

    app.directive('listSearch', function() {
        return {
            replace: true,
            scope: {
                searchText: '=',
                disabled: '=ngDisabled',
                placeholder: '@',
                showClearButton: '='
            },
            controller: function ($scope) {
                $scope.clearSearchText = function() {
                    $scope.query= undefined;
                };
            },
            templateUrl: 'partials/list_search.html'
        };
    });

    app.config(['$stateProvider', '$urlRouterProvider', '$qProvider', function($stateProvider, $urlRouterProvider, $qProvider) {

        $qProvider.errorOnUnhandledRejections(false);

        $urlRouterProvider.otherwise('/');

        $stateProvider.state('home', {
            url: '/',
            templateUrl: 'partials/home.html',
            controller: 'HomeController',
            resolve: {
                users: function (UsersServices){
                    return UsersServices.getUsers();
                }
            }
        })

        .state('login', {
            url: '/login',
            templateUrl: 'partials/login.html',
            controller: 'LoginController',
            resolve: {
                users: function (UsersServices){
                    return UsersServices.getUsers();
                }
            }
        })


        .state('products', {
            abstract: true,
            url: '/products',
            template: '<div ui-view class="page-transition"></div>'
        })

        .state('products.list', {
            url: '/list',
            views: {
                "": {
                    templateUrl: 'partials/products.html',
                    controller: 'ProductsController',
                },
            },
            resolve : {
                products: function (ProductsServices){
                    return ProductsServices.getProducts();
                }
            },
            require: 'js/iic-underscore.js'
        })

        .state('products.record', {
            url: '/:subId',
            views: {
                "": {
                    templateUrl: 'partials/products.record.html',
                    controller: 'ProductsRecordController',
                },
            },
            resolve: {
                product: function ($stateParams, ProductsServices){
                    return ProductsServices.getProductById($stateParams.subId);
                },
            },
        })

        .state('users', {
            abstract: true,
            url: '/users',
            template: '<div ui-view class="page-transition"></div>'
        })

        .state('users.list', {
            url: '/list',
            views: {
                "": {
                    templateUrl: 'partials/users.html',
                    controller: 'UsersController',
                },
            },
            resolve : {
                users: function (UsersServices){
                    return UsersServices.getUsers();
                }
            },
            require: 'js/iic-underscore.js'
        })

        .state('users.record', {
            url: '/:subId',
            views: {
                "": {
                    templateUrl: 'partials/users.record.html',
                    controller: 'UsersRecordController',
                },
            },
            resolve: {
                user: function ($stateParams, UsersServices){
                    return UsersServices.getUsersById($stateParams.subId);
                },
            },
        })


    }]);

    app.controller('AppCtrl', function ($scope, $mdMedia, $mdSidenav, $state, _, $rootScope) {

        if(!$rootScope.logged){
            $state.go('login');
        }

        $scope.currentNavItem = "home";

        $scope.$mdMedia = $mdMedia;

        $scope.$mdSidenav = $mdSidenav;

        $scope.isInState = function isInState(sref) {

            return $state.includes(sref);
        };

        $scope.openSidebar = function() {
            $scope.$mdSidenav('left').toggle();
        };

        $scope.closeSidebar = function() {
            $scope.$mdSidenav('left').close();
        };

        $scope.isSidebarOpen = function() {
            return $scope.$mdSidenav('left').isOpen();
        };

        $scope.goTo = function(state){
            $state.go(state);
        }

    })

    .directive('mainToolbar', function() {
        return {
            replace: true,
            restrict: 'E',
            transclude: true,
            templateUrl: 'partials/main.toolbar.html',
            scope: { 'crumbs': '=' },

            controller: function($scope, $rootScope, $mdSidenav, $mdMedia, $state) {

                $scope.$mdMedia = $mdMedia;

                $scope.$mdSidenav = $mdSidenav;

                $scope.openSidebar = function() {
                    $scope.$mdSidenav('left').toggle();
                };

                $scope.closeSidebar = function() {
                    $scope.$mdSidenav('left').close();
                };

                $scope.isSidebarOpen = function() {
                    return $scope.$mdSidenav('left').isOpen();
                };

            }
        };
    });

})(tecinfapp);


