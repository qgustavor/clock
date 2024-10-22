// Based on https://github.com/STRML/textFit/blob/7a1eed6db54a97798556eed3c57b2ce1f87dbab4/textFit.js

/**
 * textFit v2.3.1
 * Previously known as jQuery.textFit
 * 11/2014 by STRML (strml.github.com)
 * MIT License
 *
 * To use: textFit(document.getElementById('target-div'), options);
 *
 * Will make the *text* content inside a container scale to fit the container
 * The container is required to have a set width and height
 * Uses binary search to fit text with minimal layout calls.
 * Version 2.0 does not use jQuery.
 */

const defaultSettings = {
  alignVert: false, // if true, textFit will align vertically using css tables
  alignHoriz: false, // if true, textFit will set text-align: center
  multiLine: false, // if true, textFit will not set white-space: no-wrap
  detectMultiLine: true, // disable to turn off automatic multi-line sensing
  reProcess: true, // if true, textFit will re-process already-fit nodes. Set to 'false' for better performance
  widthOnly: false, // if true, textFit will fit text to element width, regardless of text height
  scaleFactor: 1
}

export default function textFit (els, options) {
  if (!options) options = {}

  // Extend options.
  const settings = Object.assign({}, defaultSettings, options)

  // Support passing a single el
  const elType = Object.prototype.toString.call(els)
  if (elType !== '[object Array]' && elType !== '[object NodeList]' &&
    elType !== '[object HTMLCollection]') {
    els = [els]
  }

  // Process each el we've passed.
  for (let i = 0; i < els.length; i++) {
    processItem(els[i], settings)
  }
};

/**
 * The meat. Given an el, make the text inside it fit its parent.
 * @param  {DOMElement} el       Child el.
 * @param  {Object} settings     Options for fit.
 */
function processItem (el, settings) {
  // Set textFitted attribute so we know this was processed.
  if (!settings.reProcess) {
    el.setAttribute('textFitted', 1)
  }

  // Get element data
  const originalWidth = innerWidth(el)
  const originalHeight = innerHeight(el)

  const innerSpan = el.querySelector('span.textFitted')
  let low, mid, high
  low = settings.minFontSize || 0
  high = settings.maxFontSize || originalHeight

  // Binary search for highest best fit
  let size = low
  while (low <= high) {
    mid = (high + low) >> 1
    innerSpan.style.fontSize = `${mid}px`
    const innerSpanBoundingClientRect = innerSpan.getBoundingClientRect()
    if (
      innerSpanBoundingClientRect.width <= originalWidth &&
      (settings.widthOnly || innerSpanBoundingClientRect.height <= originalHeight)
    ) {
      size = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
    // await injection point
  }
  // found, updating font if differs:
  if (innerSpan.style.fontSize !== `${size}px`) {
    innerSpan.style.fontSize = `${size * settings.scaleFactor}px`
  }
}

// Calculate height without padding.
function innerHeight (el) {
  const style = window.getComputedStyle(el, null)
  return el.getBoundingClientRect().height -
    parseInt(style.getPropertyValue('padding-top'), 10) -
    parseInt(style.getPropertyValue('padding-bottom'), 10)
}

// Calculate width without padding.
function innerWidth (el) {
  const style = window.getComputedStyle(el, null)
  return el.getBoundingClientRect().width -
    parseInt(style.getPropertyValue('padding-left'), 10) -
    parseInt(style.getPropertyValue('padding-right'), 10)
}
