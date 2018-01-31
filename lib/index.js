'use strict';

const filters = require('./filters');
const instaFilters = require('./instaFilters');
const fs = require('fs');
const Canvas = require('canvas');

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
    this.vignette = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDgwIDYwIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImEiPjxzdG9wIG9mZnNldD0iLjMiIHN0b3Atb3BhY2l0eT0iMCIvPjxzdG9wIG9mZnNldD0iLjM1IiBzdG9wLW9wYWNpdHk9Ii4wMSIvPjxzdG9wIG9mZnNldD0iLjQiIHN0b3Atb3BhY2l0eT0iLjAzIi8+PHN0b3Agb2Zmc2V0PSIuNDUiIHN0b3Atb3BhY2l0eT0iLjA1Ii8+PHN0b3Agb2Zmc2V0PSIuNSIgc3RvcC1vcGFjaXR5PSIuMDkiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1vcGFjaXR5PSIuMTMiLz48c3RvcCBvZmZzZXQ9Ii42IiBzdG9wLW9wYWNpdHk9Ii4xOCIvPjxzdG9wIG9mZnNldD0iLjY1IiBzdG9wLW9wYWNpdHk9Ii4yMyIvPjxzdG9wIG9mZnNldD0iLjciIHN0b3Atb3BhY2l0eT0iLjI4Ii8+PHN0b3Agb2Zmc2V0PSIuNzUiIHN0b3Atb3BhY2l0eT0iLjMzIi8+PHN0b3Agb2Zmc2V0PSIuOCIgc3RvcC1vcGFjaXR5PSIuMzciLz48c3RvcCBvZmZzZXQ9Ii44NSIgc3RvcC1vcGFjaXR5PSIuNDEiLz48c3RvcCBvZmZzZXQ9Ii45IiBzdG9wLW9wYWNpdHk9Ii40NCIvPjxzdG9wIG9mZnNldD0iLjk1IiBzdG9wLW9wYWNpdHk9Ii40NyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1vcGFjaXR5PSIuNDkiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMiIvPjwvZmlsdGVyPjxwYXRoIGZpbGw9InVybCgjYSkiIGZpbHRlcj0idXJsKCNiKSIgZD0iTS0yMC0zMGgxMjBWOTBILTIweiIvPjwvc3ZnPg==';

  }

  /**
   * importImage
   *
   * @param {Buffer | Object} image - an image buffer (node) or image object (browser)
   * @returns {Function}
   */

  importImage(image) {
    if (typeof window === 'object') { // browser
      this.canvas = document.createElement('canvas');
      this.w = this.canvas.width = image.naturalWidth * this.scale;
      this.h = this.canvas.height = image.naturalHeight * this.scale;
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
    console.log(effect);
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
    console.log(filterName);
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
        if(err) return console.log(err);
        console.log('Saved as ' + filename);
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
