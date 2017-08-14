import jQuery from 'jquery';
import Rx from 'rxjs/Rx';

var $ = jQuery;

class ElasticModel {
    constructor (opts) {
        this.opts = opts;
        this.indices = new Rx.BehaviorSubject([]);
        this.$indexList = $(opts.indicesSelector);
        this.indices.subscribe(values => this.renderIndices(values));
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
    renderIndices(values){
        var self = this;
        this.$indexList.empty();
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            var $li = $('<li />').append($('<a/>').html(value));
            this.$indexList.append($li);
            Rx.Observable.fromEvent($li, 'click')
                .map(e => { return { model: self, data: e.target.innerText }})
                .subscribe(this.onItemClicked);
        }

    }
    onItemClicked(data) {
        console.log(data);
        // Rx.Observable.defer(() => Rx.Observable.fromPromise($.ajax({
        //         url: this.opts.api.query + 'value',
        //         data: {
        //             keyword: 'pdf'
        //         },
        //     }))).subscribe(response => {
        //         if(response.success) {
        //             this.indices.next(response.data);
        //         } else {
        //             console.log("Failure");
        //         }
        //     });
    }
}

module.exports = ElasticModel;