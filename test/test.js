'use strict';

const filterous = require('../lib/');
const fs = require('fs');

let input = __dirname + '/leia.jpg';
let output = __dirname + '/leia-alt.jpg';

describe('Resize the image', function() {
  describe('#resize)', function() {
    it('should reduce the image size without error', function(done) {
      fs.readFile(input, (err, buffer) => {
        let f = filterous.importImage(buffer, {scale: 0.5});
      }, done);
    });
  });
});

describe('Apply a filter', function() {
  describe('#applyFilter()', function() {
    it('should apply a filter without error', function(done) {
      fs.readFile(input, (err, buffer) => {
        let f1 = filterous.importImage(buffer)
          .applyFilter('brightness', 0.2);
      }, done);
    });
  });
});

describe('Apply an Insta-filter', function() {
  describe('#applyInstaFilter()', function() {
    it('should apply a filter without error', function(done) {
      fs.readFile(input, (err, buffer) => {
        let f2 = filterous.importImage(buffer)
          .applyInstaFilter('1977');
      }, done);
    });
  });
});

describe('Save an image', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      fs.readFile(input, (err, buffer) => {
        let f3 = filterous.importImage(buffer)
          .save(output);
      }, done);
    });
  });
});

describe('Apply an Insta-fileter, then another filter and save', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      fs.readFile(input, (err, buffer) => {
        let f4 = filterous.importImage(buffer)
          .applyInstaFilter('amaro')
          .applyFilter('convolute', [ 1/9, 1/9, 1/9,
                                      1/9, 1/9, 1/9,
                                      1/9, 1/9, 1/9 ])
          .save('test.jpg');
      }, done);
    });
  });
});
