'use strict';

console.log('%cdb-explorer', 'font-size: 24px');

var Table = require('./table');

var table = new Table();

window.main = function () {

  var t = document.getElementById('table');
  t.appendChild(table.element);

  var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    ESC: 27,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    SPACEBAR: 32,
    ENTER: 13,
    DELETE: 46
  };

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