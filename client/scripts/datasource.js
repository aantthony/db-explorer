'use strict';

var Readable = require('stream').Readable;

module.exports = DataSource;

var sampledata = require('./sampledata');

require('util').inherits(QueryStream, Readable);

/**
 * Stream of incoming query results.
 */
function QueryStream() {
  Readable.call(this, {objectMode: true});
}

/**
 * Sample data query. Delayed to simulate network latency.
 * @return {[type]} [description]
 */
QueryStream.prototype._read = function () {
  var self = this;
  if (this._sent) return;
  this._sent = true;
  var index = 0;
  var l = sampledata.length;

  var next = function () {
    if (index >= l) {
      self.push(null);
      return;
    }

    var nGet = Math.floor(Math.random() * 10);
    for(var i = 0; i < nGet; i++) {
      if (index >= l) {
        self.push(null);
        return;
      }
      self.push(sampledata[index]);
      index++;
    }

    setTimeout(next, Math.random() * 50);
  };

  setTimeout(next, 200 + Math.random() * 20);
};


/**
 * Table controller data source
 */
function DataSource () {

}

DataSource.prototype.query = function (params) {
  // just return sample data for now:
  var str = new QueryStream();
  return str;
};
