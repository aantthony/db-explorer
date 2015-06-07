'use strict';

console.log('%cdb-explorer', 'font-size: 24px');

var Table = require('./table');
var TableManager = require('./tablemanager');
var DataSource = require('./datasource');

var table = new Table();

var tableController = new TableManager();
var KEYS = require('./keys');

var dataSource = new DataSource();

window.main = function (t) {

  t.appendChild(table.element);
  table.delegate = tableController;

  tableController.dataSource = dataSource;

  tableController.table = table;
    
  tableController.show();

  function handleKey(event) {
    switch (event.keyCode) {
      case KEYS.ESC: {
        if (table.editing) {
          table.cancelEdit();
          return true;
        }
        break;
      }
      case KEYS.ARROW_LEFT: {
        if (table.editing) {
          var input = table.selector.input;
          if (input.selectionStart !== 0) {
            return;
          }
        }
        table.left();
        return true;
      }
      case KEYS.TAB: {
        table.right();
        return true;
      }
      case KEYS.ARROW_RIGHT: {
        if (table.editing) {
          var inputNode = table.selector.input;
          if (inputNode.selectionStart !== inputNode.value.length) {
            return;
          }
        }
        table.right();
        return true;
      }
      case KEYS.ARROW_UP: {
        table.up();
        return true;
      }
      case KEYS.ARROW_DOWN: {
        table.down();
        return true;
      }
      case KEYS.ENTER: {
        table.down();
        return true;
      }
      case KEYS.DELETE:
      case KEYS.BACKSPACE: {
        if (table.editing) return;
        if (table.selector) {
          var target = table.selector.target;
          table.set(target.i, target.j, null);
          return true;
        }
        break;
      }
      case KEYS.SHIFT: {
        break;
      }
      default: {
        if (table.selector) {

          var character = String.fromCharCode(event.keyCode);

          if (character) {
            var target = table.selector.target;
            table.set(target.i, target.j, '');
            table.edit();
          }
        }
      }
    }
  }

  document.body.addEventListener('keydown', function (event) {
    if (handleKey(event)) {

      event.preventDefault();
      return false;
    }
  });


};