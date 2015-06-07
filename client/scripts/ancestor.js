'use strict';

/**
 * Find the closest ancestor of `node` for which `node.nodeName === nodeName`.
 * @param  {DOMElement}         node
 * @param  {String}             nodeName
 * @return {DOMElement | null}  ancestor node
 */
module.exports = function (node, nodeName) {
  nodeName = nodeName.toUpperCase();
  while(node && node.nodeName !== nodeName) {
    node = node.parentNode;
  }
  return node || null;
};
