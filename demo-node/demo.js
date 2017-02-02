'use strict'

const filterous = require('../lib/');
const fs = require('fs');

let imgPath = __dirname + '/images/leia.jpg';
let output = __dirname + '/images/output/';

// Async
fs.readFile(imgPath, (err, buffer) => {
  if (err) throw err;
  let f1 = filterous.importImage(buffer)
    .applyFilter('brightness', 0.2)
    .applyFilter('colorFilter', [255, 255, 0, 0.05])
    .applyFilter('convolute', [ 1/9, 1/9, 1/9,
                                1/9, 1/9, 1/9,
                                1/9, 1/9, 1/9 ])
    .save(output + 'leia-1.jpg');

  // with optional params
  let f2 = filterous.importImage(buffer, {scale: 0.5, format: 'png'})
    .applyInstaFilter('amaro')
    .save(output  + 'leia-2.png');
});



// Blocking (sync) example
let buf = fs.readFileSync(imgPath);
filterous.importImage(buf)
  .overlayImage(__dirname +'/images/bokeh-stars.png')
  .save(output  + 'leia-3.jpg');

  