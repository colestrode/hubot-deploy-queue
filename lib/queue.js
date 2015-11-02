var _ = require('lodash')
  , db;

/**
 * Initializes the queue
 * @param database
 */
module.exports.init = function(database) {
  db = database;
  db.queue = db.queue || [];
};

/**
 * Returns the queue data, used for debugging only
 * @returns {*|Array}
 */
module.exports.get = function() {
  return db.queue;
};

/**
 * Is the queue empty?
 * @returns {boolean}
 */
module.exports.isEmpty = function() {
  return db.queue.length === 0;
};

/**
 * Is this item at the head of the queue
 * @param item
 * @returns {Number|boolean}
 */
module.exports.isCurrent = function(item) {
  return _.findIndex(db.queue, item) === 0;
};

/**
 * Is this item immediately following the head
 * @param item
 * @returns {Number|boolean}
 */
module.exports.isNext = function(item) {
  return _.findIndex(db.queue, item) === 1;
};

/**
 * Does the queue contain this item?
 * @param item
 * @returns {boolean}
 */
module.exports.contains = function(item) {
  return _.find(db.queue, item) !== undefined;
};

/**
 * The length of the queue
 * @returns {Number}
 */
module.exports.length = function() {
  return db.queue.length;
};

/**
 * Adds an item to the queue
 * @param item
 * @returns {Number}
 */
module.exports.push = function(item) {
  return db.queue.push(item);
};

/**
 * Returns the head of the queue
 * @returns {*}
 */
module.exports.current = function() {
  return db.queue[0];
};

/**
 * Returns the item after the head
 * @returns {*}
 */
module.exports.next = function() {
  return db.queue[1];
};

/**
 * Removes first element from the queue
 * @returns {*} Returns the new head of the queue
 */
module.exports.advance = function() {
  db.queue.shift();
  return db.queue[0];
};

/**
 * Removes all instances of the item from the queue.
 * @param item
 * @returns {number} Returns the number or items removed
 */
module.exports.remove = function(item) {
  var start = db.queue.length;
  _.pullAt(db.queue, _.findIndex(db.queue, item));
  return start - db.queue.length;
};
