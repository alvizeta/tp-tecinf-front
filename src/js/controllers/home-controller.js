(function(app) {

	app.controller('HomeController', function($scope, $resource, $state, $rootScope, $mdSidenav, _, users) {

	    $scope.stateName = 'Home';

	    if(!$rootScope.logged & !users){
	        $scope.errorMessage = "Ocurrió un error, contacte al administrador."
        }

        if(!$rootScope.logged){
            $state.go('login');
        }

	});

})(tecinfapp);
