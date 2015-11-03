var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , proxyquire = require('proxyquire')
  , EventEmitter = require('events')
  , util = require('util');

chai.use(require('sinon-chai'));

describe.only('Index', function() {
  var DeployQueue
    , queueMock
    , BrainMock
    , robotMock
    , resMock;

  beforeEach(function() {
    queueMock = {};

    ['init', 'get', 'isEmpty', 'isCurrent', 'isNext', 'contains', 'length', 'current', 'next', 'advance', 'remove'].forEach(function(method) {
      queueMock[method] = sinon.stub();
    });

    resMock = {
      send: sinon.stub(),
      reply: sinon.stub(),
      message: {
        user: {
          name: 'heisenberg'
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
});

