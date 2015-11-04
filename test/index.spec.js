var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , proxyquire = require('proxyquire')
  , EventEmitter = require('events')
  , util = require('util');

chai.use(require('sinon-chai'));

describe('Index', function() {
  var DeployQueue
    , queueMock
    , BrainMock
    , robotMock
    , resMock;

  beforeEach(function() {
    queueMock = {};

    ['init', 'get', 'isEmpty', 'isCurrent', 'isNext', 'contains', 'length', 'push', 'current', 'next', 'advance', 'remove'].forEach(function(method) {
      queueMock[method] = sinon.stub();
    });

    resMock = {
      send: sinon.stub(),
      reply: sinon.stub(),
      message: {
        user: {
          name: 'walterwhite'
        }
      },
      match: []
    };

    BrainMock = function() {
      EventEmitter.call(this);
    };
    util.inherits(BrainMock, EventEmitter);

    robotMock = {
      brain: new BrainMock(),
      respond: sinon.stub(),
      messageRoom: sinon.stub()
    };

    DeployQueue = proxyquire('../index', {
      './lib/queue': queueMock
    });
  });

  it('should call queue.init when brain is loaded', function() {
    DeployQueue(robotMock);
    robotMock.brain.emit('loaded');

    expect(robotMock.brain.deploy).to.exist;
    expect(robotMock.brain.deploy).to.be.an('object');
    expect(queueMock.init).to.have.been.calledWith(robotMock.brain.deploy);
  });

  it('should play pong', function() {
    robotMock.respond.withArgs(/deploy ping/i).yields(resMock);

    DeployQueue(robotMock);

    expect(resMock.send).to.have.been.calledWith('deploy pong');
    expect(resMock.reply).to.have.been.calledWith('deploy reply pong');
  });

  it('should send help', function() {
    robotMock.respond.withArgs(/deploy help/i).yields(resMock);

    DeployQueue(robotMock);

    expect(resMock.send.firstCall.args[0]).to.match(/^`deploy add _metadata_`:/);
  });

  describe('add', function() {

    beforeEach(function() {
      robotMock.respond.withArgs(/deploy (add)(.*)?/i).yields(resMock);
      queueMock.contains.returns(false);
    });

    it('should reply if user is already in the queue', function() {
      queueMock.contains.returns(true);
      DeployQueue(robotMock);
      expect(queueMock.contains).to.be.calledWith({name: 'walterwhite'});
      expect(resMock.reply.firstCall.args[0]).to.match(/^Whoa, hold you're horses!/);
    });

    it('should add metadata', function() {
      queueMock.length.returns(0);
      resMock.match[1] = 'heisenberg';

      DeployQueue(robotMock);

      expect(queueMock.push.firstCall.args[0]).to.deep.equal({name: 'walterwhite', metadata: 'heisenberg'});
    });

    it('should allow a user to deploy immediately if there are no users in the queue', function() {
      queueMock.length.returns(0);
      DeployQueue(robotMock);
      expect(resMock.reply).to.have.been.calledWith('Go for it!');
    });

    it('should reply if the user is going to be next', function() {
      queueMock.length.returns(1);
      DeployQueue(robotMock);
      expect(resMock.reply).to.have.been.calledWith('Alrighty, you\'re up next!');
    });

    it('should tell the user how many people are before them if they aren\'t next', function() {
      queueMock.length.returns(10);
      DeployQueue(robotMock);
      expect(resMock.reply.firstCall.args[0]).to.match(/9/);
    });
  });

  describe('done', function() {
    beforeEach(function() {
      robotMock.respond.withArgs(/deploy (done|complete|donzo)/i).yields(resMock);
    });

    it('should not remove a user if they aren\'t in the queue', function() {
      queueMock.contains.returns(false);
      DeployQueue(robotMock);
      expect(queueMock.contains).to.be.calledWith({name:'walterwhite'});
      expect(resMock.reply.firstCall.args[0]).to.match(/Ummm, this is a little embarrassing/);
    });

    it('should reply if the user isn\'t at the head of the queue', function() {
      queueMock.contains.returns(true);
      queueMock.isCurrent.returns(false);
      DeployQueue(robotMock);
      expect(queueMock.isCurrent).to.be.calledWith({name:'walterwhite'});
      expect(resMock.reply.firstCall.args[0]).to.match(/Nice try/);
    });

    it('should advance the queue and notify the next user', function() {
      queueMock.contains.returns(true);
      queueMock.isCurrent.returns(true);
      queueMock.isEmpty.returns(false);
      queueMock.current.returns({name:'jessepinkman'});

      DeployQueue(robotMock);
      expect(queueMock.advance).to.be.called;
      expect(resMock.reply.firstCall.args[0]).to.match(/Nice job!/);
      expect(robotMock.messageRoom).to.have.been.calledWithMatch('jessepinkman');
    });

    it('should advance the queue and not notify if there is no next', function() {
      queueMock.contains.returns(true);
      queueMock.isCurrent.returns(true);
      queueMock.isEmpty.returns(true);

      DeployQueue(robotMock);
      expect(queueMock.advance).to.be.called;
      expect(resMock.reply.firstCall.args[0]).to.match(/Nice job!/);
      expect(robotMock.messageRoom).not.to.have.been.called;
    });
  });

  describe('next', function() {

    beforeEach(function() {
      robotMock.respond.withArgs(/deploy (next|who\'s (next|on first|on deck))/i).yields(resMock);
    });

    it('should respond if there is no next', function() {
      queueMock.next.returns(undefined);
      DeployQueue(robotMock);
      expect(resMock.send).to.have.been.calledWith('Nobodyz!');
    });

    it('should respond if the current user is next', function() {
      queueMock.next.returns({name: 'heisenberg'});
      queueMock.isNext.returns(true);

      DeployQueue(robotMock);
      expect(resMock.reply).to.have.been.calledWith('You\'re up next! Get ready!');
    });

    it('should respond if someone else is on deck', function() {
      queueMock.next.returns({name: 'capncook'});
      queueMock.isNext.returns(false);

      DeployQueue(robotMock);
      expect(resMock.send).to.have.been.calledWith('capncook is on deck.');
    });
  });

  describe('remove', function() {
    beforeEach(function() {
      robotMock.respond.withArgs(/deploy (remove|kick) (.*)/i).yields(resMock);

      resMock.match[1] = 'remove';
      resMock.match[2] = 'gus';
    });

    it('should remove the specified user and not notify next user when user is not at the head', function() {
      queueMock.isCurrent.returns(false);
      queueMock.length.returns(2);
      queueMock.contains.returns(true);

      DeployQueue(robotMock);

      expect(queueMock.isCurrent).to.have.been.calledWith({ name: 'gus' });
      expect(queueMock.remove).to.have.been.calledWith({ name: 'gus' });
      expect(resMock.send.firstCall.args[0]).to.match(/gus has been removed from the queue/);
      expect(queueMock.current).not.to.have.been.called;
      expect(robotMock.messageRoom).not.to.have.been.called;
    });

    it('should remove the specified user and notify next user when user is at head', function() {
      queueMock.isCurrent.returns(true);
      queueMock.length.returns(2);
      queueMock.contains.returns(true);
      queueMock.current.returns({name:'heisenberg'});

      DeployQueue(robotMock);

      expect(queueMock.isCurrent).to.have.been.calledWith({ name: 'gus' });
      expect(queueMock.remove).to.have.been.calledWith({ name: 'gus' });
      expect(resMock.send.firstCall.args[0]).to.match(/gus has been removed from the queue/);
      expect(robotMock.messageRoom).to.have.been.calledWith('heisenberg', 'Hey, you\'re turn to deploy!');
    });

    it('should remove the specified user and not notify the next user if the list is empty', function() {
      queueMock.isCurrent.returns(true);
      queueMock.length.returns(0);
      queueMock.contains.returns(true);

      DeployQueue(robotMock);

      expect(queueMock.isCurrent).to.have.been.calledWith({ name: 'gus' });
      expect(queueMock.remove).to.have.been.calledWith({ name: 'gus' });
      expect(resMock.send.firstCall.args[0]).to.match(/gus has been removed from the queue/);
      expect(queueMock.current).not.to.have.been.called;
      expect(robotMock.messageRoom).not.to.have.been.called;
    });

    it('should not remove a user who is not in the queue', function() {
      queueMock.isCurrent.returns(false);
      queueMock.length.returns(2);
      queueMock.contains.returns(false);

      DeployQueue(robotMock);

      expect(queueMock.isCurrent).to.have.been.calledWith({ name: 'gus' });
      expect(queueMock.remove).not.to.have.been.called;
      expect(resMock.send).to.have.been.calledWith('gus isn\'t in the queue :)');
      expect(queueMock.current).not.to.have.been.called;
      expect(robotMock.messageRoom).not.to.have.been.called;
    });

    describe('me', function() {

      beforeEach(function() {
        resMock.match[2] = 'me';
      });

      it('should reply if user isn\'t in the queue', function() {
        queueMock.contains.returns(false);
        DeployQueue(robotMock);

        expect(resMock.reply.firstCall.args[0]).to.match(/No sweat!/);
      });

      it('should should not remove user when user is at the head', function() {
        queueMock.contains.returns(true);
        queueMock.isCurrent.returns(true);
        DeployQueue(robotMock);

        expect(queueMock.isCurrent).to.have.been.calledWith({ name: 'walterwhite' });
        expect(queueMock.contains).to.have.been.calledWith({ name: 'walterwhite' });
        expect(resMock.reply.firstCall.args[0]).to.match(/You're deploying right now!/);
      });

      it('should remove the user from the queue and not notify', function() {
        queueMock.contains.returns(true);
        queueMock.length.returns(2);
        queueMock.isCurrent.returns(false);

        DeployQueue(robotMock);

        expect(queueMock.isCurrent).to.have.been.calledWith({ name: 'walterwhite' });
        expect(queueMock.contains).to.have.been.calledWith({ name: 'walterwhite' });
        expect(queueMock.remove).to.have.been.calledWith({ name: 'walterwhite' });
        expect(resMock.reply.firstCall.args[0]).to.match(/Alright, I took you out of the queue/);
        expect(queueMock.current).not.to.have.been.called;
        expect(robotMock.messageRoom).not.to.have.been.called;
      });
    });
  });
});

