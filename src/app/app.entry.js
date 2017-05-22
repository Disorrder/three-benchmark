import './vendor.js';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import './core3d/three';
import './pages/common.styl';

angular.module('app', [
    uiRouter,
])

require('./app.run.js');
require('./pages/main');
