'use strict';

var ContextMenu = require('contextmenu');
module.exports = Table;

function makeSelector() {
  var element = document.createElement('selector');
  var input = document.createElement('input');
  input.type = 'text';
  element.appendChild(input);
  element.input = input;
  return element;
}

/**
 * Infinite editable table canvas
 */
function Table() {
  this.element = document.createElement('div');
  this._selector = makeSelector();

  this._cells = [];

  var table = document.createElement('table');
  var tbody = document.createElement('tbody');
  for(var i = 0; i < 50; i++) {
    var rowcells = [];
    var tr = document.createElement('tr');
    for(var j = 0; j < 15; j++) {
      var val = Math.floor(Math.random() * 4000);
      val = '';
      var td = document.createElement('td');
      td.appendChild(document.createTextNode(val));
      td.i = i;
      td.j = j;
      rowcells.push(td);
      tr.appendChild(td);
    }
    this._cells.push(rowcells);
    tbody.appendChild(tr);
  }
  
  table.appendChild(tbody);
  this.element.appendChild(table);

  this.table = table;

  table.addEventListener('mousedown', _mousedown.bind(this));
  table.addEventListener('mouseup', _mouseup.bind(this));
  table.addEventListener('mousemove', _mousemove.bind(this));

  table.addEventListener('keydown', _keydown.bind(this));
  this._selector.addEventListener('focus', _focusSelector.bind(this), true);
  this._selector.addEventListener('blur', _blurSelector.bind(this), true);
}

Table.prototype.start = function () {

  var menu = ContextMenu([
    {label: 'Add Row Above'},
    {label: 'Add Row Below'},
    {hr: true},
    {label: 'Add Column Before'},
    {label: 'Add Column After'},
    {hr: true},
    {label: 'Delete Row'},
    {label: 'Delete Column'},
    {hr: true},
    {label: 'Cut'},
    {label: 'Copy'},
    {label: 'Paste'},
    {label: 'Clear All'},
    {hr: true},
    {label: 'Wrap Text in Cell', checked: true}
  ]);

  ContextMenu.attach(this.table, menu);

};

function px(n) {
  return n + 'px';
}

function _mouseup(event) {
  var td = event.target;
  _setSelector.call(this, td, this._selectionStart);
  if (this._selectionStart === td) {
    this._selector.style.pointerEvents = '';
  }
  this._selectionStart = null;
}
function _mousedown(event) {
  var td = event.target;
  this._selectionStart = td;
  _setSelector.call(this, td);
  this._selector.style.pointerEvents = 'none';
}
function _mousemove(event) {
  var s = this._selectionStart;
  if (!s) return;
  var td = event.target;
  _setSelector.call(this, td, s);
}

function _keydown(event) {
  if (!this.selector) return;
}

function _focusSelector(event) {
  if (!this.selector) return;
  if (event.target !== this.selector.input) return;
  var target = this.selector.target;
  event.target.value = _getCellValue(target);
  target.style.color = 'transparent';
  this.editing = target;
}
function _blurSelector(event) {
  _unsetEditing.call(this, true, false);
}

function _unsetEditing(alreadyBlurred, cancel) {
  if (!this.editing) return;
  _setCellValue(this.editing, this.selector.input.value);
  this.selector.input.value = '';
  this.editing.style.removeProperty('color');
  this.editing = null;

  if (!alreadyBlurred) {
    this.selector.input.blur();
  }
}

function extendRects(r1, r2) {
  var rect = {
    top: Math.min(r1.top, r2.top),
    left: Math.min(r1.left, r2.left)
  };

  rect.width  = Math.max(r1.left + r1.width,  r2.left + r2.width)  - rect.left;
  rect.height = Math.max(r1.top  + r1.height, r2.top  + r2.height) - rect.top;

  return rect;
}

function _setSelector(td, td2) {

  var shouldSelect = this.delegate.tableShouldSelect(this, td.i, td.j, td);
  if (!shouldSelect) return;

  if (this.editing) {
    this.finishEdit();
  }

  var base = this.element.getBoundingClientRect();
  var rect = td.getBoundingClientRect();

  if (td2 && td2 !== td) {
    var rect2 = td2.getBoundingClientRect();
    rect = extendRects(rect, rect2);
  }

  var selector = this._selector;
  var margin = 2;

  selector.style.top = px(rect.top - base.top - 1 - margin);
  selector.style.left = px(rect.left - base.left - 1 - margin);
  selector.style.width = px(rect.width - 1 + 2 * margin);
  selector.style.height = px(rect.height - 1 + 2 * margin);
  selector.target = td;

  if (!this.selector) this.element.appendChild(selector);
  this.selector = selector;
}
function _getCellValue(td) {
  return td.childNodes[0].nodeValue;
}
function _setCellValue(td, value) {
  if (!td) return;
  value = value || '';
  if (_getCellValue(td) === value) return;
  console.log('UPDATE [%s, %s] = %s', td.i, td.j, value);
  td.childNodes[0].nodeValue = value;
}

Table.prototype.cell = function (i, j) {
  var row = this._cells[i];
  if (!row) return;
  return row[j];
};

Table.prototype.getRectForCell = function (cell) {
  return cell.getBoundingClientRect();
};

Table.prototype.deselect = function () {
  if (this.selector) {
    this._selector.parentNode.removeChild(this._selector);
    this.selector = null;
  }
};

Table.prototype.left = function () {
  if (!this.selector) return;
  var td = this.selector.target.previousSibling;
  if (!td) return;
  _setSelector.call(this, td);
};

Table.prototype.right = function () {
  if (!this.selector) return;
  var td = this.selector.target.nextSibling;
  if (!td) return;
  _setSelector.call(this, td);
};

Table.prototype.up = function () {
  if (!this.selector) return;
  var current = this.selector.target;
  var td = this.cell(current.i - 1, current.j);
  if (!td) return;
  _setSelector.call(this, td);
};

Table.prototype.down = function () {
  if (!this.selector) return;
  var current = this.selector.target;
  var td = this.cell(current.i + 1, current.j);
  _setSelector.call(this, td);
};

Table.prototype.set = function (i, j, value) {
  if (Array.isArray(value)) {
    if (!Array.isArray(value[0])) {
      return this.set(i, j, [value]);
    }
    var nCols = value[0].length;
    for(var oi = 0; oi < value.length; oi++) {
      var row = value[oi];
      for(var oj = 0; oj < nCols; oj++) {
        _setCellValue(this.cell(i + oi, j + oj), row[oj]);
      }
    }
    return;
  }
  _setCellValue(this.cell(i, j), value);
};

Table.prototype.getSelectorPosition = function () {
  console.log('getSelectorPosition', this.selector);
  if (!this.selector) return;
  var current = this.selector.target;
  return {i: current.i, j: current.j};
};

Table.prototype.setSelectorPosition = function (position) {
  if (!position) return;
  var td = this.cell(position.i, position.j);
  _setSelector.call(this, td);
};

Table.prototype.edit = function () {
  if (!this.selector) return;
  this.selector.input.focus();
};

Table.prototype.cancelEdit = function () {
  _unsetEditing.call(this);
};
Table.prototype.finishEdit = function () {
  _unsetEditing.call(this);
};