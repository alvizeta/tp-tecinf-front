(function(app) {

    app.controller('LoginController', function($scope, $resource, $rootScope, _, $state, $mdToast, UsersServices, users) {

        $scope.users = users;

        $scope.showSimpleToast = function(text) {

            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .hideDelay(3000)
            );
        };

        $scope.verify = function(){

            var userFound = _.findWhere(users, { username: $scope.username, password: $scope.password});
            if(userFound){
                $rootScope.logged = true;
                $rootScope.userLogged = userFound;
                $scope.showSimpleToast('Log in existoso');
                $state.go('products.list');
            }else{
                $scope.showSimpleToast('Acceso Denegado');
            }

            //$rootScope.logged = true;
            //$rootScope.userLogged = true;
            //$scope.showSimpleToast('Log in existoso');
            //$state.go('products.list');
        }

    });

})(tecinfapp);
