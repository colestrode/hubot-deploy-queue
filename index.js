var _ = require('lodash');

module.exports = function(robot) {
  robot.brain.deployQueue = [];

  robot.respond(/deploy (me|moi)/i, queueUser);
  robot.respond(/deploy (done|complete|donzo)/i, dequeueUser);
  robot.respond(/deploy (forget (it|me)|nevermind)/i, forgetUser);
  robot.respond(/deploy (next|who\'s (next|on first))/i, whosNext);

  /**
   * Add a user to the queue
   * @param res
   */
  function queueUser(res) {
    var user = res.message.user.name
      , queue = robot.brain.deployQueue
      , length = queue.length;

    queue.push(user);

    res.reply(JSON.stringify(user, null, 2));

    if(length < 1) {
      res.send('Go for it ' + user + '!');
    } else if(length === 1) {
      res.send('Alrighty, ' + user + ', you\'re up next!');
    } else {
      res.send('Cool, There\'s a couple of people ahead of you, so I\'ll let you know when you\'re up.');
    }
  }

  /**
   * Removes a user from the queue if they exist and notifies the next user
   * @param res
   */
  function dequeueUser(res) {
    var user = res.message.user.name
      , queue = robot.brain.deployQueue
      , found = _.find(queue, user);

    if(!found) {
      res.send('Ummm, this is a little embarrassing, but you aren\'t in the queue :grimacing:');
    } else if(queue[0] !== user) {
      res.send('Nice try ' + user + ', no cutting!');
    } else {
      robot.brain.deployQueue = queue = _.pullAt(queue, 0);
      res.send('Great job ' + user + '! I\'ll let the next person know.');
      res.send('@' + queue[0] + ' you\'re up!');
    }
  }

  /**
   * Who's up next?
   * @param res
   */
  function whosNext(res) {
    var user = res.message.user.name
      , queue = robot.brain.deployQueue;

    if(queue.length === 0) {
      res.send('Nobodyz!');
    } else if (user === queue[1]) {
      res.send('You\'re up next ' + user + '! Get ready!');
    } else {
      res.send(queue[1] + ' is on deck.');
    }
  }

  /**
   * Removes first instance of the user from the queue
   * @param res
   */
  function forgetUser(res) {
    var user = res.message.user.name
      , queue = robot.brain.deployQueue
      , index = _.indexOf(queue, user);

    if(index < 0) {
      res.reply('No sweat! You weren\'t even in the queue :)');
    } else {
      robot.brain.deployQueue = queue = _.pullAt(queue, index);
      res.reply('Alright, I took you out of the queue. Come back soon!');
    }
  }
};

