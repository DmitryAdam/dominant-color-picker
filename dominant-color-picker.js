/*!
 * dominant-color-picker.js v1.0.0
 * Extract dominant colors from any image — client-side, zero dependencies.
 * https://github.com/dmitryadam/dominant-color-picker
 * MIT License
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = factory()
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global.DominantColorPicker = factory());
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {

  'use strict';

  /**
   * Default options.
   * @typedef {Object} DominantColorOptions
   * @property {number} topN           - Number of colors to return (default: 8)
   * @property {number} bucketSize     - Quantization bucket size, lower = more precise (default: 24)
   * @property {number} whiteThreshold - RGB value above which a pixel is considered near-white (default: 220)
   * @property {number} blackThreshold - RGB value below which a pixel is considered near-black (default: 30)
   * @property {number} minSaturation  - Minimum HSV saturation to include a color (default: 0.12)
   */
  const DEFAULTS = {
    topN: 8,
    bucketSize: 24,
    whiteThreshold: 220,
    blackThreshold: 30,
    minSaturation: 0.12,
  };

  /**
   * Extract dominant colors from an HTMLImageElement.
   *
   * @param {HTMLImageElement} img  - A fully loaded image element.
   * @param {DominantColorOptions} [opts] - Options overrides.
   * @returns {{ hex: string, pct: string, dominant: boolean }[]}
   *
   * @throws {Error} If the canvas is tainted by CORS.
   */
  function fromImage(img, opts) {
    const cfg = Object.assign({}, DEFAULTS, opts);

    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const colorMap = {};
    let totalPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

      if (a < 128) continue;
      if (r > cfg.whiteThreshold && g > cfg.whiteThreshold && b > cfg.whiteThreshold) continue;
      if (r < cfg.blackThreshold && g < cfg.blackThreshold && b < cfg.blackThreshold) continue;

      const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
      const sat  = maxC === 0 ? 0 : (maxC - minC) / maxC;
      if (sat < cfg.minSaturation) continue;

      const bs = cfg.bucketSize;
      const qr = Math.min(255, Math.round(r / bs) * bs);
      const qg = Math.min(255, Math.round(g / bs) * bs);
      const qb = Math.min(255, Math.round(b / bs) * bs);
      const key = `${qr},${qg},${qb}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
      totalPixels++;
    }

    const toHex = v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0');

    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, cfg.topN)
      .map(([key, count], idx) => {
        const [r, g, b] = key.split(',').map(Number);
        const hex = ('#' + toHex(r) + toHex(g) + toHex(b)).toUpperCase();
        const pct = totalPixels > 0
          ? ((count / totalPixels) * 100).toFixed(1)
          : '0.0';
        return { hex, pct, dominant: idx === 0 };
      })
      .filter(c => /^#[0-9A-F]{6}$/.test(c.hex));
  }

  /**
   * Load an image from a URL and extract dominant colors.
   *
   * @param {string} url          - Public image URL (server must allow CORS).
   * @param {DominantColorOptions} [opts]
   * @returns {Promise<{ hex: string, pct: string, dominant: boolean }[]>}
   */
  function fromURL(url, opts) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          resolve(fromImage(img, opts));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Load an image from a File/Blob and extract dominant colors.
   *
   * @param {File|Blob} file
   * @param {DominantColorOptions} [opts]
   * @returns {Promise<{ hex: string, pct: string, dominant: boolean }[]>}
   */
  function fromFile(file, opts) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          resolve(fromImage(img, opts));
        } catch (e) {
          reject(e);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load file as image.'));
      };
      img.src = url;
    });
  }

  return { fromImage, fromURL, fromFile, DEFAULTS };
}));
