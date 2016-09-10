'use strict'

var stream = require('highland')

function repartition (partitioner, concat) {
  var unmatched = []

  return function consume (err, x, push, next) {
    if (err) {
      push(err)
      next()
    } else if (x === stream.nil) {
      if (unmatched.length) {
        push(null, unmatched[0])
      }
      push(null, x)
    } else {
      var op = unmatched.length ? partitioner(concat(unmatched.pop(), x)) : partitioner(x)
      op.collect().toCallback(function (err, xs) {
        if (err) {
          push(err)
          next()
        } else if (!xs.length) {
          next()
        } else if (xs.length === 1) {
          unmatched[0] = xs[0]
          next()
        } else {
          push(null, xs[0])
          xs.slice(1, -1).forEach(function (x) {
            push(null, x)
          })
          unmatched[0] = xs[xs.length - 1]
          next()
        }
      })
    }
  }
}

module.exports = repartition
