function Hit(data) {
  var self = this;             // this object (a new Hit())
  ko.utils.extend(self, data); // copies all fields from data to self

  self.hasHighlights = (self.highlight && self.highlight["attachment.content"] && self.highlight["attachment.content"].length > 0) ? true : false;

  if(self._source && self._source)
    ko.utils.extend(self, self._source); // copies all fields from data to self

  if(self.attachment) {
    if (self.attachment.content_type === 'application/msword' || self.attachment.content_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || self.attachment.content_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.template' || self.attachment.content_type === 'application/vnd.ms-word.document.macroEnabled.12' || self.attachment.content_type === 'application/vnd.ms-word.template.macroEnabled.12') {
      self.icon = 'fa fa-file-word-o';
    } else if (self.attachment.content_type === 'audio/basic') {
      self.icon = 'fa fa-file-audio-o';
    } else if (self.attachment.content_type === 'video/msvideo' || self.attachment.content_type === 'video/avi' || self.attachment.content_type === 'video/x-msvideo') {
      self.icon = 'fa fa-file-video-o';
    } else if (self.attachment.content_type === 'image/bmp' || self.attachment.content_type === 'image/gif' || self.attachment.content_type === 'image/jpeg' || self.attachment.content_type === 'image/png' || self.attachment.content_type === 'image/svg+xml' || self.attachment.content_type === 'image/tiff') {
      self.icon = 'fa fa-file-image-o';
    } else if (self.attachment.content_type === 'application/pdf') {
      self.icon = 'fa fa-file-pdf-o';
    } else if (self.attachment.content_type === 'application/vnd.openxmlformats-officedocument.presentationml.template' || self.attachment.content_type === 'application/vnd.openxmlformats-officedocument.presentationml.slideshow' || self.attachment.content_type === 'application/vnd.ms-powerpoint' || self.attachment.content_type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      self.icon = 'fa fa-file-powerpoint-o';
    } else if (self.attachment.content_type === 'application/vnd.ms-excel' || self.attachment.content_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || self.attachment.content_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.template' || self.attachment.content_type === 'application/vnd.ms-excel.sheet.macroEnabled.12' || self.attachment.content_type === 'application/vnd.ms-excel.template.macroEnabled.12' || self.attachment.content_type === 'application/vnd.ms-excel.addin.macroEnabled.12' || self.attachment.content_type === 'application/vnd.ms-excel.sheet.binary.macroEnabled.12') {
      self.icon = 'fa fa-file-excel-o';
    } else {
      self.icon = 'fa fa-file-text-o';
    }
  }
}

  function Model() {
    var self = this;
   
    self.arr = ko.observableArray([]);
    self.index = "{{ elastic_index }}";
    self.type = '{{ elastic_type }}';
    
    self.client = new elasticsearch.Client({
      hosts: [
        'http://{{elastic_host}}'
      ],
      log: 'trace'
    });
   
    self.client.ping({
      // ping usually has a 3000ms timeout
      requestTimeout: 10000
    }, function (error) {
      if (error) {
        console.log('Could not connect to ElasticSearch cluster!');
      } else {
        console.log('Connected to ElasticSearch cluster!');
      }
    });

    self.client.cat.indices({
         h: ['index']
    }, function (error, response, status) {
         var array = response.split('\n');
         self.getData(array);
       
    });

    self.getData = function(res) {
      ko.utils.arrayForEach(res, function(data) {
        self.arr.push(data)
      });
    };

    self.dropDown = self.arr;
    self.q = ko.observable('');
    self.hits = ko.observableArray();

    self.clear = function() {
      self.q(null);
      self.reload();
    }

    self.changeDropdown = function(ele) {
      self.index = ele;
      self.clear();
      $('#select em').html(ele);
    };

    self.reload = function() {
      var body = {
        index: self.index,
        type: self.type,
        size: 20,
        body: {
          _source: ['filename', 'attachment.content', 'attachment.content_type', 'attachment.author', 'attachment.name', 'attachment.title', 'attachment.content_length', 'attachment.date', 'attachment.language', 'attachment.keywords' ]
        }
      };
   
      
      if(self.q() && self.q().trim().length > 0) {
        body.body.query = {
          bool: {
            must: [ {
              match: {
                'attachment.content': self.q()
              }
            } ],
            filter: [ {
              term: { isEnabled: true }
            } ]
          }
        };

        body.body.highlight = {
          tags_schema: 'styled',
          fields: {
            'attachment.content': {
              pre_tags : ['<mark>'],
              post_tags : ['</mark>'],
              fragment_size: 150,
              number_of_fragments: 10,
              order: 'score'
            }
          }
        };
      } else {
        body.body.query = {
          bool: {
            filter: {
              term: {isEnabled: true}
            }
          }
        };
      }

      self.client.search(body).then(function (resp) {
        var hits = resp.hits.hits;
        // console.log(hits)
        var hitsMap = hits.map(function(hit){ return new Hit(hit); })
        self.hits(hitsMap);
      }, alert);
    }

    self.delete = function(data) {
      self.client.delete({
        index: self.index,
        type: self.type,
        id: data._id,
        ignore: [404]
      }, function(err, body){
        if(err) {
          alert(err);
        }
        if(body.found) {
          self.hits.remove(data);
          console.log('Document successfully deleted from ElasticSearch!');
        }
      });
    };

    function nop(event) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      document.body.className = event.type === 'dragleave' ? '' : 'drop';
    }
    document.body.addEventListener('dragenter', nop);
    document.body.addEventListener('dragover', nop, false);
    document.body.addEventListener('dragleave', nop);
    document.body.addEventListener('drop', function(event) {
      event.stopPropagation();
      event.preventDefault();

      [].forEach.call(event.dataTransfer.files, function(file){
      
        var reader = new FileReader();
        reader.addEventListener('load', function(event){
          self.client.index({
            index: self.index,
            type: self.type,
            pipeline: 'attachment',
            refresh: 'true',
            body: {
              isEnabled: true,
              "@timestamp": (new Date()).toISOString(),
              filename: file.name,
              data: event.target.result.substr(event.target.result.indexOf(',') + 1)
            }
          }).then(function(body){
            body._score = 0;
            body.filename = file.name;
            body.attachment = {
              'date': (new Date(file.lastModified)).toISOString(),
              'content_type': file.type,
              'content_length': file.size
            };

            self.hits.push(new Hit(body));
            console.log('Document successfully ingested in ElasticSearch!');
            console.log(body);
          });
        });
        reader.readAsDataURL(file);
        document.body.className = '';
      });

    }, false);


    self.mappings = {
      index: self.index,
      body: {
        mappings: {}
      }
    };

    self.mappings.body.mappings[self.type] = {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        refresh_interval: '1s'
      },
      _all: { enabled: false },
      properties: {
        '@timestamp': { type: 'date', format: 'strict_date_optional_time||epoch_millis'},
        id: { type: 'keyword', 'store': false, 'index': false },
        message: { type: 'keyword', 'store': false, 'index': false },
        filename: { type: 'keyword', ignore_above: 256 },
        customer_id : {type : 'keyword', 'store': false, 'index': false },
        isEnabled: { type: 'boolean'},
        data: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        attachment: {
          properties : {
            content_length : { type: 'long' },
            position : { type: 'long' },
            author : { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            date : { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            language : { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            name : { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            title : { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            keywords : { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            content_type: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            content: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } }, analyzer: 'english', term_vector: 'with_positions_offsets' },
          }
        }
      }
    };

    self.client.indices.exists({index: self.index}, function(body, exists){
     
      if(!exists) {
        //alert(self.index)
        self.client.create({
              index: self.index,
              type: self.type,
              mappings: self.mappings
         //     mappings: self.mappings
          }, function(err,resp,respcode){
              console.log(err,resp,respcode);
          });
      } else {//
        self.reload();
        //setTimeout(showPage, 3000);
      }
    });
  }
  var model = new Model();
  ko.applyBindings(model);