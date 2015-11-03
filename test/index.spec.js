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
      robotMock.respond.withArgs(/deploy (add) (.*)/i).yields(resMock);
      queueMock.contains.returns(false);
    });

    it('should reply if user is already in the queue', function() {
      queueMock.contains.returns(true);
      DeployQueue(robotMock);
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

  describe('remove', function() {
    it('should remove the specified user', function() {
      robotMock.respond.withArgs(/deploy (remove|kick) (.*)/i).yields(resMock);
      resMock.match[1] = 'remove';
      resMock.match[2] = 'gus';
      DeployQueue(robotMock);
      expect(queueMock.remove).to.have.been.calledWithMatch({ name: 'gus' });
    });
  });
});

