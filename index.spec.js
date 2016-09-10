var expect = require('chai').expect

var _ = require('highland')
var repartition = require('./')

describe('repartition', function () {
  it('should repartition this stream as expected', function (done) {
    _([
      'Often Guests forget ', 'their things,\n',
      'Leave their hats, their coats and rings\r\n',
      'Other people leave their stains,\r', '\n',
      'Leave their shadows leave their pains'
    ]).consume(repartition(
      function split (x) { return _(x.split(/\r?\n/)) },
      function concat (x, y) { return x + y }
    )).collect().toCallback(function (err, result) {
      expect(err).to.not.exist
      expect(result).to.eql([
        'Often Guests forget their things,',
        'Leave their hats, their coats and rings',
        'Other people leave their stains,',
        'Leave their shadows leave their pains'
      ])
      done()
    })
  })

  it('should repartition this too', function (done) {
    _([
      [1, 2, 3, 4, 5, 1, 2, 3],
      [],
      [4, 5, 6, 1, 2, 3, 4, 1]
    ]).consume(repartition(
      function splitter (xs) {
        if (xs.length === 0) {
          return _()
        } else {
          var buffers = [[]]
          var end = 0
          var last = xs[0]
          xs.forEach(function (x) {
            if (x < last) {
              buffers[++end] = [x]
            } else {
              buffers[end].push(x)
            }
            last = x
          })
          return _(buffers)
        }
      },
      function concatenator (x0, x1) {
        return x0.concat(x1)
      }
    )).collect().toCallback(function (err, result) {
      expect(err).to.not.exist
      expect(result).to.eql([
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4],
        [1]
      ])
      done()
    })
  })
})
