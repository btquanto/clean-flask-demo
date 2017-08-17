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
    query: '/elastic/query'
  },
  indicesSelector : 'ul#demolist',
  hitsSelector : 'ul#hits',
  keywordInputSelector : 'input#keyword'
});

model.requestIndices();

Rx.Observable.fromEvent($('ul#demolist'), 'change')
  .subscribe(e => {
    $('button#select')
      .text($('ul#demolist').val())
      .append($('<span/>').addClass('caret'));
  });

Rx.Observable.fromEvent($('button#filter'), 'click')
  .subscribe(e => model.search($('ul#demolist').val(), $('input#keyword').val()));