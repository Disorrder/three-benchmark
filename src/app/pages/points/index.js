import './style.styl';

angular.module('app')
.config(($stateProvider) => {
    $stateProvider.state('points', {
        url: '/points',
        template: require('./template.pug')(),
        controller: require('./controller.js').default,
        controllerAs: 'page'
    })
})
