angular.module('app')

.config(['$urlRouterProvider', '$locationProvider', function($urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
  });
  $urlRouterProvider.otherwise('/');
}])

// Debug
.run(['$rootScope', '$state', ($rootScope, $state) => {
    $rootScope.$on('$stateChangeStart', (e, to) => {
        console.log('stateChangeStart', to);
    });
    $rootScope.$on('$stateChangeSuccess', (e, to) => {
        console.log('stateChangeSuccess', to);
    });
    $rootScope.$on('$stateChangeError', (e, to, toParams, from, fromParams, err) => {
        console.log('stateChangeError', err);
        $state.go('404');
    });
}])
