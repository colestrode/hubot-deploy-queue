var chai = require('chai')
  , expect = chai.expect;

describe('Queue', function() {
  var queue
    , brain;

  beforeEach(function() {
    queue = require('../lib/queue');
    brain = {};
    queue.init(brain);
  });

  it('should create a queue object', function() {
    expect(brain.queue).to.be.an.array;
    expect(brain.queue).to.have.length(0);
  });

  it('should return the queue', function() {
    expect(queue.get()).to.equal(brain.queue);
  });

  it('should test that the queue is empty', function() {
    expect(queue.isEmpty()).to.be.true;
    queue.push({name: 'walterwhite', othername: 'heisenberg'});
    expect(queue.isEmpty()).to.be.false;
  });

  it('should allow items to be pushed onto the queue', function() {
    var item = {name: 'walterwhite', othername: 'heisenberg'};
    expect(brain.queue).to.have.length(0);
    queue.push(item);
    expect(brain.queue).to.have.length(1);
  });

  it('should test if an item is at the head of the queue', function() {
    queue.push({name: 'walterwhite', othername: 'heisenberg'});
    expect(queue.isCurrent({name: 'walterwhite'})).to.be.true;
    expect(queue.isCurrent({name: 'jesse'})).to.be.false;
  });

  it('should test if an item is next', function() {
    queue.push({name: 'walterwhite', othername: 'heisenberg'});
    queue.push({name: 'jesse', othername: 'capncook'});
    expect(queue.isNext({name: 'walterwhite'})).to.be.false;
    expect(queue.isNext({name: 'jesse'})).to.be.true;
  });

  it('should test if an item contained in the queue', function() {
    queue.push({name: 'walterwhite', othername: 'heisenberg'});
    queue.push({name: 'jesse', othername: 'capncook'});
    expect(queue.contains({name: 'walterwhite'})).to.be.true;
    expect(queue.contains({name: 'jesse'})).to.be.true;
    expect(queue.contains({name: 'tortuga'})).to.be.false;
  });

  it('should return the length of the queue', function() {
    expect(queue.length()).to.equal(0);
    queue.push({name: 'walterwhite', othername: 'heisenberg'});
    queue.push({name: 'jesse', othername: 'capncook'});
    expect(queue.length()).to.equal(2);
  });

  it('should get the head of the queue', function() {
    var item = {name: 'walterwhite', othername: 'heisenberg'};
    queue.push(item);
    queue.push({name: 'jesse', othername: 'capncook'});
    expect(queue.current()).to.equal(item);
  });

  it('should get the next item in the queue', function() {
    var item = {name: 'jesse', othername: 'capncook'};
    queue.push({name: 'walterwhite', othername: 'heisenberg'});
    queue.push(item);
    expect(queue.next()).to.equal(item);
  });

  it('should advance the queue', function() {
    var walter = {name: 'walterwhite', othername: 'heisenberg'}
      , jesse = {name: 'jesse', othername: 'capncook'};

    queue.push(walter);
    queue.push(jesse);

    expect(queue.advance()).to.equal(jesse);
    expect(queue.length()).to.equal(1);

    expect(queue.advance()).to.be.undefined;
    expect(queue.length()).to.equal(0);

    //advance an empty queue
    expect(queue.advance()).to.be.undefined;
    expect(queue.length()).to.equal(0);
  });

  it('should remove items from the queue', function() {
    var walter = {name: 'walterwhite', othername: 'heisenberg'}
      , jesse = {name: 'jesse', othername: 'capncook'};

    queue.push(jesse);
    queue.push(walter);

    expect(queue.length()).to.equal(2);
    queue.remove({name: 'jesse'});
    expect(queue.length()).to.equal(1);
    expect(queue.contains({name: 'jesse'})).to.be.false;

    queue.push(jesse);

    expect(queue.length()).to.equal(2);
    queue.remove({name: 'jesse'});
    expect(queue.length()).to.equal(1);
    expect(queue.contains({name: 'jesse'})).to.be.false;
  });
});
