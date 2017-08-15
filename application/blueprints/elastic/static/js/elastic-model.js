import jQuery from 'jquery';
import Rx from 'rxjs/Rx';

var $ = jQuery;

class ElasticModel {
    constructor (opts) {
        this.opts = opts;
        
        var $ = jQuery;
        
        this.indices = new Rx.BehaviorSubject([]);
        this.hits = new Rx.BehaviorSubject([]);
        
        this.$indexList = $(opts.indicesSelector);
        this.$hitList = $(opts.hitsSelector);

        this.indices.subscribe(indices => this.renderIndices(indices));
        this.hits.subscribe(hits => this.renderHits(hits));
    }
    requestIndices() {
        Rx.Observable.defer(() => Rx.Observable.fromPromise($.ajax({
                url: this.opts.api.indices
            }))).subscribe(response => {
                if(response.success) {
                    this.indices.next(response.data);
                } else {
                    console.log("Failure");
                }
            });
    }
    renderIndices(indices){
        var self = this;
        this.$indexList.empty();
        for (var i = 0; i < indices.length; i++) {
            var index = indices[i];
            var $li = $('<li />').append($('<a/>').html(index));
            this.$indexList.append($li);
            Rx.Observable.fromEvent($li, 'click')
                .map(e => { return { model: self, index: e.target.innerText }})
                .subscribe(data => this.onItemClicked(data.model, data.index));
        }

    }
    onItemClicked(model, index) {
        var self = this;
        Rx.Observable.defer(() => Rx.Observable.fromPromise($.ajax({
                method: "POST",
                url: model.opts.api.query,
                data: {
                    index: index,
                },
            }))).subscribe(response => {
                if(response.success != false) {
                    self.hits.next(response);
                } else {
                    console.log("Failure============");
                    console.log(response);
                    console.log("==================");
                }
            });
    }
    renderHits(file_hits) {
        var self = this;
        this.$hitList.empty();
        console.log(file_hits);
        for(var i = 0; i < file_hits.length; i++) {
            var file_hit = file_hits[i];

            var $highlights = $('<ol/>');
            var hits = file_hit.hits;
            for (var j = 0; j < hits.length; j++) {
                var hit = hits[j];
                var highlights = hit.content;
                for (var k = 0; k < highlights.length; k++) {
                    var highlight = highlights[k];
                    $highlights
                        .append($('<li/>')
                            .addClass('media')
                            .append($('<div/>')
                                .addClass('media-body')
                                .html(highlight)
                            )
                            .append($('<div/>')
                                .addClass('media-right')
                                .html('p' + hit.page_number)
                            )
                        );
                }
            }
            
            var $li = $('<li />')
                .addClass('list-group-item')
                .append($('<div/>')
                    .addClass('media')
                    .append($('<div/>')
                        .addClass('media-body')
                        .append($('<i/>').text('icon'))
                        .append($('<strong/>').html(file_hit.title))
                    )
                    .append($('<div/>')
                        .addClass('media-right')
                        .html('Score: ')
                        .append($('<strong/>').html('XXX'))
                    )
                )
                .append($('<div>').append($highlights));
            this.$hitList.append($li);
        }
    }
}

module.exports = ElasticModel;