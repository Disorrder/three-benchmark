import './vendor.js';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import modal from 'angular-ui-bootstrap/src/modal';

import './core3d/three';
import './pages/common.styl';

angular.module('app', [
    uiRouter,
    modal,
])

require('./app.run.js');
require('./pages/main');
require('./pages/points');
