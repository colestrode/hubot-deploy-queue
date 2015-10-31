var _ = require('lodash')
  , queue = require('./lib/queue');


module.exports = function(robot) {
  robot.brain.on('loaded', function() {
    queue.init(robot.brain);
  });

  robot.respond(/deploy (me|moi)/i, queueUser);
  robot.respond(/deploy (done|complete|donzo)/i, dequeueUser);
  robot.respond(/deploy (forget (it|me)|nevermind)/i, forgetMe);
  robot.respond(/deploy (current|who\'s (deploying|at bat))/i, whosDeploying);
  robot.respond(/deploy (next|who\'s (next|on first|on deck))/i, whosNext);
  robot.respond(/deploy (remove|kick|sayonara) (.*)/i, whosNext);
  robot.respond(/deploy (list)/i, listQueue);
  robot.respond(/deploy (dump|debug)/i, queueDump);

  robot.respond(/deploy ping/i, function(res) {
    res.send('deploy pong');
    res.reply('deploy reply pong');
  });

  /**
   * Add a user to the queue
   * @param res
   */
  function queueUser(res) {
    var user = res.message.user.name
      , length = queue.length();

    queue.push(user);

    if (length === 0 && queue.isCurrent(user)) {
      res.reply('Go for it!');
      return;
    }

    if (length === 1 && queue.isNext(user)) {
      res.reply('Alrighty, you\'re up next!');
      return;
    }

    res.reply('Cool, There\'s ' + (length - 1) + ' person(s) ahead of you. I\'ll let you know when you\'re up.');
  }

  /**
   * Removes a user from the queue if they exist and notifies the next user
   * @param res
   */
  function dequeueUser(res) {
    var user = res.message.user.name;

    if (!queue.contains(user)) {
      res.reply('Ummm, this is a little embarrassing, but you aren\'t in the queue :grimacing:');
      return;
    }

    if (!queue.isCurrent(user)) {
      res.reply('Nice try, but it\'s not your turn yet');
      return;
    }

    queue.advance();
    res.reply('thanks');

    if (!queue.isEmpty()) {
      // Send DM to next in line if the queue isn't empty
      notifyUser(queue.current());
    }
  }

  /**
   * Who's deploying now?
   * @param res
   */
  function whosDeploying(res) {
    var user = res.message.user.name;

    if (queue.isEmpty()) {
      res.reply('Nobodyz!');
    } else if (isCurrent(user)) {
      res.reply('It\'s you. _You\'re_ deploying. Right now.');
    } else {
      res.send(queue.current() + ' is deploying.');
    }
  }

  /**
   * Who's up next?
   * @param res
   */
  function whosNext(res) {
    var user = res.message.user.name;

    if (queue.isEmpty()) {
      res.send('Nobodyz!');
    } else if (queue.isNext(user)) {
      res.reply('You\'re up next! Get ready!');
    } else {
      res.send(queue.next() + ' is on deck.');
    }
  }

  /**
   * Removes first instance of the user from the queue
   * @param res
   */
  function forgetMe(res) {
    var user = res.message.user.name;

    if (!queue.contains(user)) {
      res.reply('No sweat! You weren\'t even in the queue :)');
      return;
    }

    if (queue.isCurrent(user)) {
      res.reply('You\'re deploying right now! Did you mean `deploy done`?');
      return;
    }

    queue.removeOne(user);
    res.reply('Alright, I took you out of the queue. Come back soon!');

  }

  /**
   * Removes all references to a user from the queue
   * @param res
   */
  function removeUser(res) {
    var user = res.match[1]
      , notifyNextUser = queue.isCurrent(user)
      , removed = queue.removeAll(user);

    res.send(user + ' has been removed from the queue. I hope that\'s what you meant to do...');

    if (notifyNextUser) {
      notifyUser(queue.current());
    }
  }

  /**
   * Prints a list of users in the queue
   * @param res
   */
  function listQueue(res) {
    if (queue.isEmpty()) {
      res.send('Nobodyz! Like this: []');
    } else {
      res.send('Here\'s who\'s in the queue: ' + queue.get().join(', ') + '.');
    }
  }

  /**
   * Dumps the queue to the channel for debugging
   * @param res
   */
  function queueDump(res) {
    res.send(JSON.stringify(queue.get(), null, 2));
  }

  /**
   * Notify a user via DM that it's their turn
   * @param user
   */
  function notifyUser(user) {
    robot.messageRoom(user, 'Hey, you\'re turn to deploy!');
  }
};

