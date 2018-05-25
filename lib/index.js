'use strict';

const filters = require('./filters');
const instaFilters = require('./instaFilters');
let fs;
let Canvas;
let debug = function() {};

if (typeof window === 'undefined') {
  Canvas = require('canvas');
  fs = require('fs');
  debug = require('debug')("filterous");
}


//module.exports.Filterous = Filterous;

module.exports.importImage = (imageBuffer, options) => {
  let filterous = new Filterous(imageBuffer, options);
  return filterous.importImage(imageBuffer, options);
}

/**
 * Filterous Class
 *
 * @class
 * @param {Buffer} imageBuffer
 */

class Filterous {

  constructor(image, options) {
    this.options = options || {format: 'jpeg'};
    this.scale = (this.options.scale) ? this.options.scale : 1;
    this.w = 300;
    this.h = 300;
    this.vignette = require('./vignette.js');
  }

  /**
   * importImage
   *
   * @param {Buffer | Object} image - an image buffer (node) or CanvasImageSource (browser)
   * @returns {Function}
   */

  importImage(image) {
    if (typeof window === 'object') { // browser
      this.canvas = document.createElement('canvas');
      const width = (image.naturalWidth || parseInt(image.width) || image.offsetWidth) * this.scale;
      const height = (image.naturalHeight || parseInt(image.height) || image.offsetHeight) * this.scale;
      this.w = this.canvas.width = width;
      this.h = this.canvas.height = height;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.drawImage(image, 0, 0, this.w, this.h);
    } else {
      let img = this.initImage();
      img.onload = () => {
        this.w = img.width * this.scale;
        this.h = img.height * this.scale;
        this.canvas = new Canvas(this.w, this.h);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.drawImage(img, 0, 0, this.w, this.h);
      };
      img.src = image;
    }
    return this;
  }

  /**
   * Apply filter - e.g. applyFilter('contrast', 0.1);
   *
   * @param {String} effect - the name of the filter effect
   * @param {Number} adjustment - adjustment value (mostly -1 < v < 1) for the effect
   * @returns {Function}
   */

  applyFilter(effect, adjustment) {
    debug(effect);
    let newPixels;
    let p = new Promise((resolve) => {
      this.pixels = this.ctx.getImageData(0, 0, this.w, this.h);
      newPixels = filters[effect].apply(this, [this.pixels, adjustment]);
      resolve(newPixels);
    });
    p.then(this.render(newPixels));
    return this;
  }

  /**
   * Apply instaFilter - Giving a predefined Instagram-like effect  e.g. applyInstaFilter('amaro');
   *
   * @param {String} effect - the name of the filter effect
   * @param {Number} adjustment - adjustment value (mostly -1 < v < 1) for the effect
   * @returns {Function}
   */

  applyInstaFilter(filterName) {
    debug(filterName);
    filterName = filterName.toLowerCase();
    let newPixels;

    let p = new Promise((resolve) => {
      this.pixels = this.ctx.getImageData(0, 0, this.w, this.h);
      newPixels = instaFilters[filterName].apply(this, [this.pixels]);
      resolve(newPixels);
    });

    if(filterName === 'mayfair' || filterName === 'rise' || filterName === 'hudson' || filterName === 'xpro2' || filterName === 'amaro' || filterName === 'earlybird' || filterName === 'sutro' || filterName == 'toaster' || filterName === 'brannan') {
      let p1 = new Promise((resolve) => {
        p.then(this.render(newPixels));
        resolve();
      });
      p1.then(this.applyVignette());
    } else {
      p.then(this.render(newPixels));
    }
    return this;
  }

  /**
   * Overlay an image on top of the canvas
   * @param {String} imgSrc - the path to the image you want to overlay
   * @returns {Function}
   */
  overlayImage(imgSrc) {
    let imgObj = this.initImage();
    imgObj.onload = () => {
      this.ctx.drawImage(imgObj, 0, 0, this.w, this.h);
    };
    imgObj.src = imgSrc;

    return this;
  }

  applyVignette() {
    this.overlayImage(this.vignette);
  }

  /**
   * Render the pixel data onto the canvas
   * Callback after done applying a filter
   * @param {Object} newPixels - altered pixel data
   */
  render(newPixels) {
    this.ctx.putImageData(newPixels, 0, 0);
  }

  /**
   * Save a file to HD (Node only)
   * @param {String} filename - path/to/file.jpg
   * @returns {Function}
   */
  save(filename) {
    let type = 'image/' + this.options.format;

    this.canvas.toDataURL(type, function(err, base64) { // Sync JPEG is not supported bu node-canvas
      let base64Data = base64.split(',')[1];
      let binaryData = new Buffer(base64Data, 'base64');
      fs.writeFile(filename, base64Data, {encoding: 'base64'}, (err) => {
        if(err) return debug(err);
        debug('Saved as ' + filename);
      });
    });
    return this;
  }

  /**
   * Render the image object into DOM (browser only)
   * @returns {Function}
   */
  renderHtml(dom) {
    setTimeout(() => { // quick-n-dirty, to avoid it renders before vignette is applied
      dom.src = this.canvas.toDataURL('image/'+this.options.format);
    }, 10);
    
    return this;
  }

  initCanvas(w, h) {
    if (typeof window === 'object') { // browser
      let canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      return canvas;
    }
    else { // node
      return new Canvas(w, h);
    }
  }

  initImage() {
    if (typeof window === 'object') { // browser
      return new Image();
    } else { // node
      return new Canvas.Image();
    }
  }
}
