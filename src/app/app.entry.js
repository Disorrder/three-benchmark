import './vendor.js';

import './pages/main';

// init app

import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const routes = [
    { path: '/', component: require('./pages/main').default },
];

console.log(routes);

const router = new VueRouter({
    routes,
});

var app;
$(() => {
    app = new Vue({
        el: '#viewport',
        // template: '<div></div>',
        router
    });
})
