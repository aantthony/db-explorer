'use strict';

module.exports = Table;

function makeSelector() {
  var element = document.createElement('selector');
  var input = document.createElement('input');
  input.type = 'text';
  element.appendChild(input);
  element.input = input;
  return element;
}

function Table() {
  this.element = document.createElement('div');
  this._selector = makeSelector();

  this._cells = [];

  var table = document.createElement('table');
  var tbody = document.createElement('tbody');
  for(var i = 0; i < 305; i++) {
    var rowcells = [];
    var tr = document.createElement('tr');
    for(var j = 0; j < 15; j++) {
      var val = Math.floor(Math.random() * 4000);
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

  table.addEventListener('mousedown', _mousedown.bind(this));
  table.addEventListener('keydown', _keydown.bind(this));
  this._selector.addEventListener('focus', _focusSelector.bind(this), true);
  this._selector.addEventListener('blur', _blurSelector.bind(this), true);
}

function px(n) {
  return n + 'px';
}

function _mousedown(event) {
  var td = event.target;
  while (td.nodeName !== 'TD') {
    td = td.td;
    if (!td) return console.log(event.target);
  }
  _setSelector.call(this, td);
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

function _setSelector(td) {
  if (this.editing) {
    this.finishEdit();
  }
  var base = this.element.getBoundingClientRect();
  var rect = td.getBoundingClientRect();
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
  _setCellValue(this.cell(i, j), value);
};

Table.prototype.cancelEdit = function () {
  _unsetEditing.call(this);
};
Table.prototype.finishEdit = function () {
  _unsetEditing.call(this);
};