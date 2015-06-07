'use strict';

module.exports = ColumnPopup;

var ancestor = require('./ancestor');

var KEYS = require('./keys');

function px(n) {
  return n + 'px';
}

/**
 * A view for creating a new column.
 * This shows suggestions for columns to add to the view.
 * @param {Readable<T>} stream  suggestions
 * @param {(Error,<T>) -> ?} callback [description]
 */
function ColumnPopup(stream, callback) {
  this.element = document.createElement('div');
  var backdrop = document.createElement('div');
  backdrop.classList.add('columnpopup-backdrop');
  this.element.appendChild(backdrop);
  var box = document.createElement('columnpopup');
  this.box = box;
  this.element.appendChild(box);

  this._callback = callback;

  var ul = document.createElement('ul');

  var inputBox = document.createElement('div');
  var input = this.input = document.createElement('input');
  inputBox.appendChild(input);
  this.box.appendChild(inputBox);

  this.box.appendChild(ul);

  this.input.addEventListener('keyup', this._keyup.bind(this));
  ul.addEventListener('mousemove', this._mousemove.bind(this));
  ul.addEventListener('click', this._clickItem.bind(this));
  backdrop.addEventListener('click', this._close.bind(this));

  var columns = this.columns = [];

  this._selectedColumn = null;

  var self = this;

  stream
  .on('data', function (data) {

    var li = document.createElement('li');

    var column = {
      data: data,
      li: li,
      name: data.name
    };

    li.appendChild(document.createTextNode(column.name));
    ul.appendChild(li);

    columns.push(column);

    if (!self._selectedColumn) {
      self._selectedColumn = column;
      self._selectColumn(column);
    }
    self._refilter();
  })
  .on('end', function () {

  });

  self._refilter();
}

ColumnPopup.prototype._close = function () {
  if (this._callback) this._callback(null);
  this.hide();
  this.element = null;
};

ColumnPopup.prototype._clickItem = function (event) {
  var li = ancestor(event.target, 'li');
  var column = this._getColumnFromNode(li);
  this._chooseColumn(column);
}

ColumnPopup.prototype._selectColumn = function (column) {
  column = column || null;
  var current = this._selectedColumn;
  if (current) {
    current.li.classList.remove('active');
  }
  if (column) {
    column.li.classList.add('active');    
  }
  this._selectedColumn = column;
};

ColumnPopup.prototype.hide = function () {
  if (!this.element) return;
  this.element.parentNode.removeChild(this.element);
  this.element = null;
};

ColumnPopup.prototype._getColumnFromNode = function (li) {
  li = ancestor(li, 'li');
  for(var i = 0; i < this.columns.length; i++) {
    var col = this.columns[i];
    if (col.li === li) {
      return col;
    }
  }
};

ColumnPopup.prototype._mousemove = function (event) {
  var column = this._getColumnFromNode(event.target);
  if (column) {
    this._selectColumn(column);
  }
};

ColumnPopup.prototype._keyup = function (event) {
  switch(event.keyCode) {
    case KEYS.ESC:
    case KEYS.ARROW_LEFT: {
      if (this._callback) this._callback(null);
      this.hide();
      return;
    }
    case KEYS.ARROW_UP: {
      var columnIndex = this.columns.indexOf(this._selectedColumn);
      if (columnIndex === 0) {
        columnIndex = this.columns.length;
      }
      this._selectColumn(this.columns[columnIndex - 1]);
      return;
    }
    case KEYS.ARROW_DOWN: {
      var columnIndex = this.columns.indexOf(this._selectedColumn);
      if (columnIndex === this.columns.length - 1) {
        columnIndex = -1;
      }
      this._selectColumn(this.columns[columnIndex + 1]);
      return;
    }
    case KEYS.ENTER: {
      this._chooseColumn(this._selectedColumn);
      return;
    }
    default: {

    }
  }

  this._refilter();

};

ColumnPopup.prototype._chooseColumn = function (column) {
  if (this._callback) this._callback(null, column && column.data || undefined);
  this.hide();
}

ColumnPopup.prototype._refilter = function () {

  var nVisible = 0;
  var regex = new RegExp('^' + this.input.value, 'i');
  var selectedColumn = this._selectedColumn;
  var needReselect = false;
  var firstVisible = null;
  this.columns.forEach(function (column) {
    var match = regex.test(column.name);
    if (match) {
      nVisible++;
      if (!firstVisible) firstVisible = column;
    }
    if (column === selectedColumn) {
      needReselect = true;
    }
    column.li.style.display = match ? 'block' : 'none';
  });

  if (needReselect || !selectedColumn) {
    this._selectColumn(firstVisible);
  }

  this.box.style.height = px(Math.min(300, nVisible * 31));

};

ColumnPopup.prototype.showFrom = function (td) {
  var rect = td.getBoundingClientRect();
  this.box.style.top  = px(rect.top + rect.height);
  this.box.style.left = px(rect.left);
  this.box.classList.add('active');
  var input = this.input;
  setTimeout(function () {
    input.focus();
  }, 10);
};