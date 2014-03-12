var pause = require("./");

it('buffers the calls until resume() is called', function(){
  var params = [];
  var qux = pause(foobar);
  var obj = { foo: 123 };
  var arr = [678, 321];

  qux(1, 2, 3);
  qux(obj, arr, 'foobar');

  expect(params.length).to.equal(0);

  qux.resume();
  qux(4, 5, 6);

  expect(params.length).to.equal(3);
  expect(params[0]).to.deep.equal([1, 2, 3]);
  expect(params[1][0]).to.equal(obj);
  expect(params[1][1]).to.equal(arr);
  expect(params[1][2]).to.equal('foobar');
  expect(params[2]).to.deep.equal([4, 5, 6]);

  function foobar () {
    params.push(Array.prototype.slice.call(arguments));
  }
});

it('keeps the context of function calls', function(done){
  var counter = 0;
  var qux = pause(foobar);

  qux.call({ i: 1 }, 10);
  qux.call({ i: 2 }, 20);
  qux.call({ i: 3 }, 30);

  qux.resume();

  qux.call({ i: 4 }, 40);
  qux.call({ i: 5 }, 50);

  function foobar (i) {
    expect(this.i * 10).to.equal(i);
    expect(this.i).to.equal(++counter);

    if (this.i == 5) done();
  }
});

it('may pause for bunch of times', function(done){
  var counter = 0;
  var qux = pause(foobar);
  var paused = true;

  qux(1);
  qux(2);
  qux(3);

  setTimeout(function () {
    qux.resume();

    paused = false;
    qux(4);
    qux(5);

    paused = true;
    qux.pause();
    qux.pause();

    qux(6);
    qux(7);

    qux.resume();
    paused = false;

    qux(8);
    qux(9);
    qux(10);

  }, 500);

  function foobar (i) {
    expect(i).to.equal(++counter);

    if ((i > 3 && i < 6) || i > 7) {
      expect(paused).to.be.false;
    } else {
      expect(paused).to.be.true;
    }

    if (i == 10) done();
  }

});
