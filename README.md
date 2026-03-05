# dominant-color-picker

> Extract dominant colors from any image — client-side, zero dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-live-black)](https://dmitryadam.github.io/dominant-color-picker/)

**[→ Live Playground](https://dmitryadam.github.io/dominant-color-picker/)**

---

## What it does

Given any image (uploaded file or public URL), `dominant-color-picker` quantizes the pixel data using a canvas-based bucket algorithm and returns the top N most dominant hex colors — sorted by frequency, with near-white, near-black, and grey pixels filtered out.

Everything runs in the browser. No server, no API key, no tracking.

---

## Playground

The `index.html` in this repo is a self-contained playground hosted on GitHub Pages.  
→ **[https://dmitryadam.github.io/dominant-color-picker/](https://dmitryadam.github.io/dominant-color-picker/)**

Features:
- Upload an image file (PNG, JPG, GIF, WEBP, SVG)
- Or paste any public image URL
- Click any swatch to copy its hex value
- Export all hex values in one click

---

## CDN

Load the standalone library via GitHub Pages CDN:

```html
<script src="https://dmitryadam.github.io/dominant-color-picker/dominant-color-picker.js"></script>
```

Or use jsDelivr (after publishing to GitHub):

```html
<script src="https://cdn.jsdelivr.net/gh/dmitryadam/dominant-color-picker@main/dominant-color-picker.js"></script>
```

---

## Usage

### Via CDN (browser)

```html
<script src="https://cdn.jsdelivr.net/gh/dmitryadam/dominant-color-picker@main/dominant-color-picker.js"></script>
<script>
  // From a public URL
  DominantColorPicker.fromURL('https://example.com/image.jpg')
    .then(colors => {
      colors.forEach(c => console.log(c.hex, c.pct + '%'));
    });

  // From a file input
  fileInput.addEventListener('change', e => {
    DominantColorPicker.fromFile(e.target.files[0])
      .then(colors => console.log(colors));
  });
</script>
```

### Via npm / ES module

```bash
# No npm package yet — copy the file or use the CDN above.
# Pull requests welcome!
```

---

## API

### `DominantColorPicker.fromURL(url, options?)`

| Param     | Type     | Description                          |
|-----------|----------|--------------------------------------|
| `url`     | `string` | Public image URL (CORS must be open) |
| `options` | `object` | See [Options](#options)              |

Returns: `Promise<Color[]>`

---

### `DominantColorPicker.fromFile(file, options?)`

| Param     | Type          | Description          |
|-----------|---------------|----------------------|
| `file`    | `File / Blob` | Image file           |
| `options` | `object`      | See [Options](#options) |

Returns: `Promise<Color[]>`

---

### `DominantColorPicker.fromImage(imgElement, options?)`

| Param        | Type               | Description                      |
|--------------|--------------------|----------------------------------|
| `imgElement` | `HTMLImageElement` | A fully loaded `<img>` element   |
| `options`    | `object`           | See [Options](#options)          |

Returns: `Color[]` (synchronous — throws if image is CORS-tainted)

---

### Options

| Option           | Type     | Default | Description                                      |
|------------------|----------|---------|--------------------------------------------------|
| `topN`           | `number` | `8`     | Max number of colors to return                   |
| `bucketSize`     | `number` | `24`    | Quantization precision (lower = more precise)    |
| `whiteThreshold` | `number` | `220`   | RGB channel value above which a pixel is skipped |
| `blackThreshold` | `number` | `30`    | RGB channel value below which a pixel is skipped |
| `minSaturation`  | `number` | `0.12`  | Minimum HSV saturation — filters greys           |

---

### Color object

```ts
{
  hex: string;       // e.g. "#D4552A"
  pct: string;       // e.g. "12.4" (percentage of total sampled pixels)
  dominant: boolean; // true only for the top color
}
```

---

## How it works

1. The image is drawn onto an off-screen `<canvas>` element.
2. Every pixel's RGBA values are read via `getImageData`.
3. Transparent, near-white, near-black, and low-saturation pixels are excluded.
4. Remaining pixels are quantized into RGB buckets of size `bucketSize`.
5. Buckets are sorted by frequency and the top `topN` are returned.

This is a fast, dependency-free approximation — not a full median-cut or k-means algorithm — but it works well for most images.

> **CORS note:** When using `fromURL`, the image server must return appropriate `Access-Control-Allow-Origin` headers. If it doesn't, the canvas will be tainted and color extraction will fail. Uploading files with `fromFile` has no such restriction.

---

## Deploy to GitHub Pages

1. Fork or clone this repo.
2. Go to **Settings → Pages** in your GitHub repo.
3. Set **Source** to `main` branch, `/` (root) folder.
4. Click **Save** — your playground will be live at `https://dmitryadam.github.io/dominant-color-picker/`.

Update the CDN and playground URLs in `README.md` and `index.html` footer with your actual username.

---

## License

[MIT](LICENSE) — free to use in personal and commercial projects.

---

## Contributing

Issues and pull requests are welcome. Ideas:

- [ ] npm package + ESM build
- [ ] k-means clustering mode for better accuracy
- [ ] Output formats: RGB, HSL, CSS variables
- [ ] React / Vue wrapper component
