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