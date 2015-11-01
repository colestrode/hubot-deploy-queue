var _ = require('lodash')
  , data;

module.exports.init = function(d) {
  data = d;
  data.deployQueue = data.deployQueue || [];
};

module.exports.get = function() {
  return data.deployQueue;
};

module.exports.isEmpty = function() {
  return data.deployQueue.length === 0;
};

module.exports.isCurrent = function(item) {
  return data.deployQueue[0] === item;
};

module.exports.isNext = function(item) {
  return data.deployQueue[1] === item;
};

module.exports.contains = function(item) {
  return _.contains(data.deployQueue, item);
};

module.exports.length = function() {
  return data.deployQueue.length;
};

module.exports.push = function(item) {
  return data.deployQueue.push(item);
};

module.exports.current = function() {
  return data.deployQueue[0];
};

module.exports.next = function() {
  return data.deployQueue[1];
};

module.exports.advance = function() {
  data.deployQueue.shift();
  return data.deployQueue[0];
};

module.exports.removeOne = function(item) {
  var start = data.deployQueue.length;
  _.pullAt(data.deployQueue, _.indexOf(data.deployQueue, item));
  return start - data.deployQueue.length;
};

module.exports.removeAll = function(item) {
  var start = data.deployQueue.length;
  _.pull(data.deployQueue, item);
  return start - data.deployQueue.length;
};
