'use strict';

var ColumnPopup = require('./columnpopup');

var Readable = require('stream').Readable;

module.exports = TableManager;

require('util').inherits(ColumnSearch, Readable);
function ColumnSearch(exclusionIds) {
  Readable.call(this, {objectMode: true});
  this.exclusionIds = exclusionIds;
}

ColumnSearch.prototype._read = function () {
  var excl = this.exclusionIds;
  var cols = [
    {id: 'name', name: 'Name'},
    {id: 'start', name: 'Took office'},
    {id: 'end', name: 'Left office'},
    {id: 'party', name: 'Party'},
    {id: 'wiki', name: 'Wikipedia Article'},
    // {id: 'thumb', name: 'Thumbnail'},
    // {id: 'portrait', name: 'Portrait'},
    {id: 'state', name: 'Home State'},
    {id: 'n', name: 'Presidency'},
  ].filter(function (col) {
    return excl.indexOf(col.id) === -1;
  });
  
  var self = this;
  cols.forEach(function (col) {
    self.push(col);
  });

  this.push(null);
};

/**
 * TableController
 * Will be renamed from manager to controller
 */
function TableManager() {
  this.columns = [{name: 'Presidency #', id: 'n'}];
}

TableManager.prototype.show = function () {
  document.title = 'US Presidents - db-explorer-beta';
  var t = this.table;
  console.log('table', this.table);
  var ii = 1;
  var col = this.columns[0];
  t.set(0,0, col.name);
  this.dataSource.query()
  .on('data', function (row) {
    t.set(ii, 0, row[col.id]);
    ii++;
  });
  this.table.start();
};

TableManager.prototype.tableShouldSelect = function (table, i, j, td) {
  var column = this.columns[j];
  var self = this;
  if (!column) {
    if (j === this.columns.length) {
      table.deselect();
      var cell = table.cell(0, j);

      var sp = {i: i, j: j - 1};
      var callback = function (err, data) {
        if (!data) {
          table.setSelectorPosition(sp);
          return;
        }

        self.columns.push(data);

        table.set(0, j, [[data.name]]);
        table.setSelectorPosition({i: i, j: j});

        var ii = 1;
        self.dataSource.query()
        .on('data', function (row) {
          var d = row[data.id];
          table.set(ii, j, d);
          ii++;
        })
        .on('end', function () {

        });

      };

      var stream = new ColumnSearch(this.columns.map(function (col) {
        return col.id;
      }));

      var popup = new ColumnPopup(stream, callback);
      document.body.appendChild(popup.element);
      popup.showFrom(table.cell(0, j));
      // show selector:
      return false;
    }
    return false;
  }
  return true;
};
