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
    , robotMock;

  beforeEach(function() {
    queueMock = {
      init: sinon.stub(),
      get: sinon.stub(),
      isEmpty: sinon.stub(),
      isCurrent: sinon.stub(),
      isNext: sinon.stub(),
      contains: sinon.stub(),
      length: sinon.stub(),
      current: sinon.stub(),
      next: sinon.stub(),
      advance: sinon.stub(),
      remove: sinon.stub()
    };

    BrainMock = function() {
      EventEmitter.call(this);
    };
    util.inherits(BrainMock, EventEmitter);

    robotMock = {
      brain: new BrainMock()
    };

    DeployQueue = proxyquire('../index', {
      './lib/queue': queueMock
    });
  });

  it('should call queue.init when brain is loaded', function(done) {
    DeployQueue(robotMock);
    robotMock.brain.emit('loaded');

    expect(robotMock.brain.deploy).to.be.an.object;
    console.log(robotMock.brain);
    expect(queueMock.init).to.have.been.calledWith(robotMock.brain.deploy);
    done();
  });
});

