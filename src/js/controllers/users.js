(function(app) {


    app.service('UsersServices', function ($resource) {


        var resource = $resource('/tec-inf-api/users', {}, {
            query: {
                method: 'GET',
                headers: [
                    {'Content-Type':'application/json'}],
                isArray: true
            },
            create: {
                method: 'POST'
            }

        });

        var resource2 = $resource('/tec-inf-api/users/:id', {}, {

            delete:{
                method: 'DELETE'
            },
            update: {
                method: 'PUT'
            }
        });

        this.getUsers = function getUsers(){
            return resource.query({}).$promise;
        };
        this.createUsers = function createUsers(user){
            return resource.create(user).$promise;
        };
        this.deleteUsersById = function deleteUsersById(id){
            return resource2.delete({id: id});
        };

        this.updateUsers = function updateUsers(id, user){
            return resource2.update({id: id}, user).$promise;
        }
        this.getUsersById = function getUsersById(id){
            return resource2.get({id: id}).$promise;
        }

    });

    app.controller('UsersController', function($scope, $resource, $state, $mdDialog, $rootScope, $mdToast, users, UsersServices) {

        'use strict';

        $scope.showSimpleToast = function(text) {

            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .hideDelay(3000)
            );
        };

        $scope.users = users;

        $scope.query = [];

        $scope.search = function (row) {
            var isIt = (angular.lowercase(row.username).indexOf(angular.lowercase($scope.query) || '') !== -1 ||
                angular.lowercase(row.email).indexOf(angular.lowercase($scope.query) || '') !== -1 );
            return isIt;
        };

        $scope.goTo = function goTo(userId) {
            $state.go('users.record', {subId: userId}, {reload:true});
        };

        $scope.goBack = function(){

        };

        $scope.$watch('query', function () {
            if($scope.query.length > 0) {
                $scope.query.toLowerCase();
            }
        });

        $scope.createNew = function (ev) {

            var user = {
                lastModifiedBy: $rootScope.userLogged.username
            };

            $scope.showDetails(ev, user);
        };

        $scope.showDetails = function (ev, user) {
            $mdDialog.show({
                templateUrl: 'partials/users.dialog.html',
                targetEvent: ev,
                clickOutsideToClose: false,
                controller: 'UsersDialog',
                escapeToClose: true,
                locals: {user: user},
                focusOnOpen: true
            }).then(function (user) {

                UsersServices.createUsers(user).then(function (data) {
                    UsersServices.getUsers().then(function (data){
                        $scope.users = data;
                    })
                });

                $scope.showSimpleToast("User created!");

            });

        };

    })

        .controller('UsersDialog', function ($scope, $mdDialog, user) {

            $scope.user = user;

            $scope.saveUser = function saveUser() {
                $mdDialog.hide($scope.user);
            };

            $scope.closeDialog = function () {
                $mdDialog.cancel();
            };

            $scope.canSave = function(){
                if($scope.user.username && $scope.user.email){
                    return false;
                }
                return true;
            };

        })

    app.controller('UsersRecordController', function($scope, $resource, $state, user, $stateParams, _, $mdToast, UsersServices) {

        'use strict';

        $scope.user = user;

        $scope.userOriginal = angular.copy($scope.user);

        $scope.$watch('user', function(newValue){
            if (!angular.equals(newValue, $scope.userOriginal)){
                $scope.allowedToSave = true;
            }else{
                $scope.allowedToSave = false;
            }
        }, true);

        $scope.$watch('userOriginal', function(newValue){
            if (!angular.equals(newValue, $scope.user)){
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
            $state.go('users.list');
        };

        $scope.updateUsers = function (){
            UsersServices.updateUsers($stateParams.subId, $scope.user).then(function (response) {
                $scope.user = response;

                $scope.userOriginal = angular.copy($scope.user);
            });

            $scope.showSimpleToast("Saved!");

        }

    });

})(tecinfapp);
