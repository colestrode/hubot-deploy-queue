var queue = require('./lib/queue')
  , _ = require('lodash');


module.exports = function(robot) {
  robot.brain.on('loaded', function() {
    queue.init(robot);
  });

  robot.respond(/deploy help/i, help);
  robot.respond(/deploy (add)(.*)?/i, queueUser);
  robot.respond(/deploy (done|complete)/i, dequeueUser);
  robot.respond(/deploy (current|who\'s deploying)/i, whosDeploying);
  robot.respond(/deploy (next|who\'s next)/i, whosNext);
  robot.respond(/deploy (remove|kick) (.*)/i, removeUser);
  robot.respond(/deploy (list)/i, listQueue);
  robot.respond(/deploy (dump|debug)/i, queueDump);

  robot.respond(/deploy ping/i, function(res) {
    res.send('deploy pong');
    res.reply('deploy reply pong');
  });

  /**
   * Help stuff
   * @param res
   */
  function help(res) {
    res.send(
      '`deploy add _metadata_`: Add yourself to the deploy queue. Hubot give you a heads up when it\'s your turn. Anything after `add` will be included in messages about what you\'re deploying. Something like `hubot deploy add my_api`.\n' +
      '`deploy done`: Say this when you\'re done and then Hubot will tell the next person. Or you could say `deploy complete`.\n' +
      '`deploy remove _user_`: Removes a user completely from the queue. Use `remove me` to remove yourself. Also works with `deploy kick _user_`.\n' +
      '`deploy next`: Sneak peek at the next person in line. Also works with `deploy who\'s next` and `deploy who\'s on first`.\n' +
      '`deploy list`: Lists the queue.\n' +
      '`deploy debug`: Kinda like `deploy list`.\n'
    );
  }

  /**
   * Add a user to the queue
   * @param res
   */
  function queueUser(res) {
    var user = res.message.user.name
      , metadata = (res.match[2] || '').trim();

    queue.push({name: user, metadata: metadata});

    var length = queue.length();
    var isCurrent = queue.isCurrent({ name: user });
    var grouped = firstGroup();

    if (length === 1) {
      res.reply('Go for it!');
    } else if (length === 2 && !isCurrent) {
      res.reply('Alrighty, you\'re up after current deployer.');
    } else if (isCurrent && length == grouped.length) {
      res.reply('Ok! You are now deploying ' + grouped.length + ' things in a row.');
    } else {
      res.reply('There\'s ' + (length - 1) + ' things to deploy in the queue ahead of you. I\'ll let you know when you\'re up.');
    }
  }

  /**
   * Removes a user from the queue if they exist and notifies the next user
   * @param res
   */
  function dequeueUser(res) {
    var user = res.message.user.name;

    if (!queue.contains({name: user})) {
      res.reply('Ummm, this is a little embarrassing, but you aren\'t in the queue :grimacing:');
      return;
    }

    if (!queue.isCurrent({name: user})) {
      res.reply('Nice try, but it\'s not your turn yet');
      return;
    }

    queue.advance();
    var grouped = firstGroup();

    if (isCurrent(user)) {
      res.reply('Nice! Only ' + grouped.length + ' more to go!' + getRandomReaction())
    } else {
      res.reply('Nice job! :tada:');
    }

    if (!queue.isEmpty() && !isCurrent(user)) {
      // Send DM to next in line if the queue isn't empty and it's not the person who just finished deploying.
      notifyUser(queue.current());
    }
  }

  /**
   * Who's deploying now?
   * @param res
   */
  function whosDeploying(res) {
    var name = res.message.user.name
      , user = {name: name};

    if (queue.isEmpty()) {
      res.send('Nobody!');
    } else if (queue.isCurrent(user)) {
      res.reply('It\'s you. _You\'re_ deploying. Right now.');
    } else {
      var current = queue.current()
        , message = current.name + ' is deploying';

      var grouped = firstGroup();

      if (grouped.length === 1) {
        message += current.metadata ? ' ' + current.metadata : '.';
      } else {
        message += ' ' + grouped.length + ' items.';
      }

      res.send(message);
    }
  }

  /**
   * Who's up next?
   * @param res
   */
  function whosNext(res) {
    var user = res.message.user.name
      , next = queue.next();

    if (!next) {
      res.send('Nobody!');
    } else if (queue.isNext({name: user})) {
      res.reply('You\'re up next!');
    } else {
      res.send(queue.next().name + ' is next.');
    }
  }

  /**
   * Removes all references to a user from the queue
   * @param res
   */
  function removeUser(res) {
    var name = res.match[2]
      , user = {name: name}
      , isCurrent = queue.isCurrent(user)
      , notifyNextUser = isCurrent && queue.length() > 1;

    if (name === 'me') {
      removeMe(res);
      return;
    }

    if (!queue.contains(user)) {
      res.send(name + ' isn\'t in the queue :)');
      return;
    }

    queue.remove(user);
    res.send(name + ' has been removed from the queue. I hope that\'s what you meant to do...');

    if (notifyNextUser) {
      notifyUser(queue.current());
    }
  }

  /**
   * Removes the current user from the queue IF the user is not at the head.
   * @param res
   */
  function removeMe(res) {
    var name = res.message.user.name
      , user = {name: name};

    if (!queue.contains(user)) {
      res.reply('No sweat! You weren\'t even in the queue :)');
    } else if (queue.isCurrent(user)) {
      res.reply('You\'re deploying right now! Did you mean `deploy done`?');
    } else {
      queue.remove(user);
      res.reply('Alright, I took you out of the queue. Come back soon!');
    }
  }

  /**
   * Prints a list of users in the queue
   * @param res
   */
  function listQueue(res) {
    if (queue.isEmpty()) {
      res.send('Nobody!');
    } else {
      res.send('Here\'s who\'s in the queue: ' + _.pluck(queue.get(), 'name').join(', ') + '.');
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
   * Get a list of all the items at the beginning of the queue for a given user.
   */
  function firstGroup() {
    var group = [];
    var last = db.queue[0];
    var index = 0;
    while (index < db.queue.length) {
      var next = db.queue[index + 1];
      if (next && next.name === last.name) {
        group.push(next);
        last = next;
        index += 1;
      } else {
        break;
      }
    }

    return group;
  }

  /**
   * Notify a user via DM that it's their turn
   * @param user
   */
  function notifyUser(user) {
    robot.messageRoom(user.name, 'Hey, it\'s your turn to deploy!');
  }

  function getRandomReaction() {
    const reactions = [':smart:', ':rocket:', ':hyperclap:', ':confetti_ball:'];
    return reactions[Math.floor(Math.random() * reactions.length)];
  }
};
