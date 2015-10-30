var _ = require('lodash')
  , queue;

module.exports.init = function(brain) {
  queue = brain.deployQueue || [];
};

module.exports.get = function() {
  return queue;
};

module.exports.isEmpty = function() {
  return queue.length === 0;
};

module.exports.isCurrent = function(item) {
  return queue[0] === item;
};

module.exports.isNext = function(item) {
  return queue[1] === item;
};

module.exports.contains = function(item) {
  return _.contains(queue, item);
};

module.exports.length = function() {
  return queue.length;
};

module.exports.push = function(item) {
  return queue.push(item);
};

module.exports.current = function() {
  return queue[0];
};

module.exports.next = function() {
  return queue[1];
};

module.exports.advance = function() {
  queue.shift();
  return queue[0];
};

module.exports.removeOne = function(item) {
  var start = queue.length;
  _.pullAt(queue, _.indexOf(queue, item));
  return start - queue.length;
};

module.exports.removeAll = function(item) {
  var start = queue.length;
  _.pull(queue, item);
  return start - queue.length;
};
