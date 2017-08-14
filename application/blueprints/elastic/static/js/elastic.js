require('bootstrap/dist/css/bootstrap.css');
require('../css/elastic.css')

global.jQuery = require('jquery');
require('bootstrap');

import Rx from 'rxjs/Rx';
import ElasticModel from './elastic-model';

var $ = jQuery;

var model = new ElasticModel({
  api : {
    indices: '/elastic/indices',
    query: '/elastic/query/'
  },
  indicesSelector : 'ul#demolist',
});

model.requestIndices();