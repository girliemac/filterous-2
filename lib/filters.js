'use strict';
const util = require('./util');

/**
 * Filter Effects
 *
 * @param {Object} pixels - canvas imageData
 * @param {Number} adj - adjustment level for the effect
 * @param {Function} callback - callback to return after obtaining the new imageData
 * @returns {Function} - callback with a new imageData
 */

// No adjustment
module.exports.grayscale = (pixels) => {
  let d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    let avg = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i + 1] = d[i + 2] = avg
  }
  return pixels;
};

// Adj is 0 (unchanged) to 1 (sepia)
module.exports.sepia = (pixels, adj) => {
  let d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = (r * (1 - (0.607 * adj))) + (g * .769 * adj) + (b * .189 * adj);
    d[i + 1] = (r * .349 * adj) + (g * (1 - (0.314 * adj))) + (b * .168 * adj);
		d[i + 2] = (r * .272 * adj) + (g * .534 * adj) + (b * (1 - (0.869 * adj)));
	}
	return pixels;
};

// No adjustment
module.exports.invert = (pixels, adj) => {
 let d = pixels.data;
 for (let i = 0; i < d.length; i += 4) {
   d[i] = 255 - d[i];
   d[i + 1] = 255 - d[i + 1];
   d[i + 2] = 255 - d[i + 2];
 }
 return pixels;
};

/* adj should be -1 (darker) to 1 (lighter). 0 is unchanged. */
module.exports.brightness = (pixels, adj) => {
  let d = pixels.data;
  adj = (adj > 1) ? 1 : adj;
  adj = (adj < -1) ? -1 : adj;
  adj = ~~(255 * adj);
  for (let i = 0; i < d.length; i += 4) {
    d[i] += adj;
    d[i + 1] += adj;
    d[i + 2] += adj;
	}
	return pixels;
};

// Better result (slow) - adj should be < 1 (desaturated) to 1 (unchanged) and < 1
module.exports.hueSaturation = (pixels, adj) => {
  let d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    let hsv = util.RGBtoHSV(d[i], d[i+1], d[i+2]);
    hsv[1] *= adj;
    let rgb = util.HSVtoRGB(hsv[0], hsv[1], hsv[2])
    d[i] = rgb[0];
    d[i + 1] = rgb[1];
    d[i + 2] = rgb[2];
	}
	return pixels;
};

// perceived saturation (faster) - adj should be -1 (desaturated) to positive number. 0 is unchanged
module.exports.saturation = (pixels, adj) => {
  let d = pixels.data;
  adj = (adj < -1) ? -1 : adj;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    let gray = 0.2989*r + 0.5870*g + 0.1140*b; //weights from CCIR 601 spec
    d[i] = -gray * adj + d[i] * (1 + adj);
    d[i + 1] = -gray * adj + d[i + 1] * (1 + adj);
    d[i + 2] = -gray * adj + d[i + 2] * (1 + adj);
  }
	return pixels;
};

// Contrast - the adj value should be -1 to 1
module.exports.contrast = (pixels, adj) => {
  adj *= 255;
  let d = pixels.data;
  let factor = (259 * (adj + 255)) / (255 * (259 - adj));
  for (let i = 0; i < d.length; i += 4) {
    d[i] = factor * (d[i] - 128) + 128;
    d[i + 1] = factor * (d[i + 1] - 128) + 128;
    d[i + 2] = factor * (d[i + 2] - 128) + 128;
  }
  return pixels;
};

// ColorFilter - add a slight color overlay. rgbColor is an array of [r, g, b, adj]
module.exports.colorFilter = (pixels, rgbColor) => {
  let d = pixels.data;
  let adj = rgbColor[3];
  for (let i = 0; i < d.length; i += 4) {
    d[i] -= (d[i] - rgbColor[0]) * adj;
    d[i + 1] -= (d[i + 1] - rgbColor[1]) * adj;
    d[i + 2] -= (d[i + 2] - rgbColor[2]) * adj;
  }
  return pixels;
};

// RGB Adjust
module.exports.rgbAdjust = (pixels, rgbAdj) => {
  let d = pixels.data;
  for (var i = 0; i < d.length; i +=4) {
    d[i] *= rgbAdj[0];		//R
    d[i + 1] *= rgbAdj[1];	//G
		d[i + 2] *= rgbAdj[2];	//B
	}
	return pixels;
};

// Convolute - weights are 3x3 matrix
module.exports.convolute = (pixels, weights) => {
  let side = Math.round(Math.sqrt(weights.length));
	let halfSide = ~~(side/2);

	let d = pixels.data;
	let sw = pixels.width;
	let sh = pixels.height;

	let w = sw;
	let h = sh;

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
  		let sy = y;
  		let sx = x;
  		let dstOff = (y * w + x) * 4;
  		let r = 0, g = 0, b = 0;
  		for (let cy = 0; cy < side; cy++) {
      	for (let cx = 0; cx < side; cx++) {
  	    	let scy = sy + cy - halfSide;
          let scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
  	    	  let srcOff = (scy * sw + scx) * 4;
  	    	  let wt = weights[cy * side + cx];
  	    	  r += d[srcOff] * wt;
  	    	  g += d[srcOff + 1] * wt;
  	    	  b += d[srcOff + 2] * wt;
          }
  	    }
      }
      d[dstOff] = r;
      d[dstOff + 1] = g;
      d[dstOff + 2] = b;
    }
	}
	return pixels;
}


/**
 * References
 * https://en.wikipedia.org/wiki/HSL_and_HSV
 * Grayscale https://en.wikipedia.org/wiki/Grayscale
 * Sepia https://software.intel.com/sites/default/files/article/346220/sepiafilter-intelcilkplus.pdf
 * Brightness https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
 * Hue Saturation hhttps://gist.github.com/mjackson/5311256
 * Persceived saturation with RGB https://stackoverflow.com/questions/13806483/increase-or-decrease-color-saturation/34183839#34183839
 * Contrast http://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/
 */
