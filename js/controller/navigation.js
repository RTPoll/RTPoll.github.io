angular.module('PollApp').controller('NavigationCtrl', function($scope, $location){
        $scope.wrapper = {};

        var currentRoute,
            defaultRoute = 'home',

            setCurrentRoute = function(){
                currentRoute = $location.$$path.substr(1);
            },

            setActiveItem = function(){
                $scope.wrapper.activeItem = currentRoute.length ? currentRoute : defaultRoute;
            };

        $scope.$on(
            '$routeChangeSuccess', function(){
                setCurrentRoute();
                setActiveItem();
            }
        );

        setCurrentRoute();
        setActiveItem();
    });
