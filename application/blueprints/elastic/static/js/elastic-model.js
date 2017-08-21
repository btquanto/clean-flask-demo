import jQuery from 'jquery';
import Rx from 'rxjs/Rx';

var $ = jQuery;

class ElasticModel {
    constructor (opts) {
        this.opts = opts;

        this.indices = new Rx.BehaviorSubject([]);
        this.hits = new Rx.BehaviorSubject([]);
        this.keyword = new Rx.BehaviorSubject([]);

        this.$indexList = $(opts.indicesSelector);
        this.$hitList = $(opts.hitsSelector);
        this.$keywordInput = $(opts.keywordInputSelector);

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
        this.$indexList.empty();
        for (var i = 0; i < indices.length; i++) {
            var index = indices[i];
            var $li = $('<li />')
                        .attr("value", index)
                        .append($('<a/>').html(index));
            this.$indexList.append($li);
            Rx.Observable.fromEvent($li, 'click')
                .map(e => e.target.innerText)
                .subscribe(idx => {
                    this.$indexList.val(idx).change();
                    this.search(idx, this.$keywordInput.val());
                });
        }
    }
    search(index, keyword) {
        var data = {
            index: index
        };
        if (keyword) {
            data.keyword = keyword;
        }
        Rx.Observable.defer(() => Rx.Observable.fromPromise($.ajax({
            method: "POST",
            url: this.opts.api.query,
            data: data
        }))).subscribe(response => {
            if(response.success != false) {
                this.hits.next(response.hits);
            } else {
                console.log("Failure============");
                console.log(response);
                console.log("==================");
            }
        });
    }
    renderHits(hits) {
        this.$hitList.empty();
        console.log(hits);
        for(var i = 0; i < hits.length; i++) {
            var hit = hits[i];

            var $highlights = $('<ol/>');
            var pages = hit.pages;
            for (var j = 0; j < pages.length; j++) {
                var page = pages[j];
                if(page.highlights) {
                    var highlights = page.highlights;
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
                                .append($('<strong/>').html('p' + page.page_number))
                                )
                            );
                    }
                }
            }

            var $li = $('<li />')
                .addClass('list-group-item')
                .append($('<div/>')
                    .addClass('media')
                    .append($('<div/>')
                        .addClass('media-body')
                        .append($('<strong/>').html(hit.title.substr(7)))
                    )
                )
                .append($('<div>').append($highlights));
            this.$hitList.append($li);
        }
    }
}

module.exports = ElasticModel;
