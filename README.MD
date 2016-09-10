# highland-repartition

[![Build Status](https://travis-ci.org/szdavid92/highland-repartition.svg?branch=master)](https://travis-ci.org/szdavid92/highland-repartition)


Repartition a [highland](https://github.com/caolan/highland) stream on your own criteria. This module helps you with partitioning strings into lines,
arrays into subarrays etc., theoretically anything as long as you can supply a function that splits and one that concatenates.

## Install

```
npm install highland-repartition
```

## Examples:

```js

var _ = require('highland')
var repartition = require('highland-repartition')

_([
  'Often Guests forget', 'their things,\n',
  'Leave their hats, their coats and rings\r\n',
  'Other people leave their stains,\r', '\n',
  'Leave their shadows leave their pains'
]).consume(repartition(
  function split (x) { return _(x.split(/\r?\n/)) },
  function concat (x0, x1) { return x0 + x1 }
))

// =>
//   Often Guests forget their things,
//   Leave their hats, their coats and rings,
//   Other people leave their stains,
//   Leave their shadows leave their pains

```

Note that this works even on the 3rd line, where the pattern is split apart. This is
because every non-matching part will concatenated and fed into the splitter
until it is matched.

To work on arbitrary input streams, the concatenating operator also has to be supplied.

Let's see a bit more complicated example:

```js

var _ = require('highland')
var repartition = require('highland-repartition')

_([
    [1, 2, 3, 4, 5, 1, 2, 3],
    [],
    [4, 5, 6, 1, 2, 3, 4, 1]
]).consume(repartition(
  function split (xs) {
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
  function concat (x0, x1) {
    return x0.concat(x1)
  }
))
// =>
//   [
//    [1, 2, 3, 4, 5],
//    [1, 2, 3, 4, 5, 6],
//    [1, 2, 3, 4],
//    [1]
//  ]

```

## Usage

`repartition(split, concatenate)`

Accepts a `split` and a `concatenate` function (both required), and returns a highland
stream.

 - `split` should accept an stream element and return a highland stream of elements.

 - `concatenate` should accept two stream elements and return one stream element.

## Contributors

[@szdavid92](https://github.com/szdavid92) - David Szakallas

## License

Copyright (c) 2016 David Szakallas

MIT License
