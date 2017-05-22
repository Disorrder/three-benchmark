// import Controller from
angular.module('app')
.config(($stateProvider) => {
    $stateProvider.state('main', {
        url: '/',
        template: require('./template.pug')(),
        controller: require('./controller.js').default,
        controllerAs: 'page'
    })
})
