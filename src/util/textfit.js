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
  minFontSize: 6,
  maxFontSize: 80,
  reProcess: true, // if true, textFit will re-process already-fit nodes. Set to 'false' for better performance
  widthOnly: false, // if true, textFit will fit text to element width, regardless of text height
  alignVertWithFlexbox: false // if true, textFit will use flexbox for vertical alignment
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
  if (!isElement(el) || (!settings.reProcess && el.getAttribute('textFitted'))) {
    return false
  }

  // Set textFitted attribute so we know this was processed.
  if (!settings.reProcess) {
    el.setAttribute('textFitted', 1)
  }

  let innerSpan
  let low, mid, high

  // Get element data.
  const originalHTML = el.innerHTML
  const originalWidth = innerWidth(el)
  const originalHeight = innerHeight(el)

  // Don't process if we can't find box dimensions
  if (!originalWidth || (!settings.widthOnly && !originalHeight)) {
    if (!settings.widthOnly) {
      throw new Error(`Set a static height and width on the target element ${el.outerHTML} before using textFit!`)
    } else {
      throw new Error(`Set a static width on the target element ${el.outerHTML} before using textFit!`)
    }
  }

  // Add textFitted span inside this container.
  if (!originalHTML.includes('textFitted')) {
    innerSpan = document.createElement('span')
    innerSpan.className = 'textFitted'
    // Inline block ensure it takes on the size of its contents, even if they are enclosed
    // in other tags like <p>
    innerSpan.style.display = 'inline-block'
    innerSpan.innerHTML = originalHTML
    el.innerHTML = ''
    el.appendChild(innerSpan)
  } else {
    // Reprocessing.
    innerSpan = el.querySelector('span.textFitted')
    // Remove vertical align if we're reprocessing.
    if (hasClass(innerSpan, 'textFitAlignVert')) {
      innerSpan.className = innerSpan.className.replace('textFitAlignVert', '')
      innerSpan.style.height = ''
      el.className.replace('textFitAlignVertFlex', '')
    }
  }

  // Prepare & set alignment
  if (settings.alignHoriz) {
    el.style['text-align'] = 'center'
    innerSpan.style['text-align'] = 'center'
  }

  // Check if this string is multiple lines
  // Not guaranteed to always work if you use wonky line-heights
  let multiLine = settings.multiLine
  if (settings.detectMultiLine && !multiLine &&
    innerSpan.getBoundingClientRect().height >= parseInt(window.getComputedStyle(innerSpan)['font-size'], 10) * 2) {
    multiLine = true
  }

  // If we're not treating this as a multiline string, don't let it wrap.
  if (!multiLine) {
    el.style['white-space'] = 'nowrap'
  }

  low = settings.minFontSize
  high = settings.maxFontSize

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
    innerSpan.style.fontSize = `${size}px`
  }

  // Our height is finalized. If we are aligning vertically, set that up.
  if (settings.alignVert) {
    addStyleSheet()
    const height = innerSpan.scrollHeight
    if (window.getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    if (!hasClass(innerSpan, 'textFitAlignVert')) {
      innerSpan.className = `${innerSpan.className} textFitAlignVert`
    }
    innerSpan.style.height = `${height}px`
    if (settings.alignVertWithFlexbox && !hasClass(el, 'textFitAlignVertFlex')) {
      el.className = `${el.className} textFitAlignVertFlex`
    }
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

// Returns true if it is a DOM element
function isElement (o) {
  return (
    typeof HTMLElement === 'object'
      ? o instanceof window.HTMLElement // DOM2
      : o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
  )
}

function hasClass ({ className }, cls) {
  return ` ${className} `.includes(` ${cls} `)
}

// Better than a stylesheet dependency
function addStyleSheet () {
  if (document.getElementById('textFitStyleSheet')) return
  const style = [
    '.textFitAlignVert{',
    'position: absolute;',
    'top: 0; right: 0; bottom: 0; left: 0;',
    'margin: auto;',
    'display: flex;',
    'justify-content: center;',
    'flex-direction: column;',
    '}',
    '.textFitAlignVertFlex{',
    'display: flex;',
    '}',
    '.textFitAlignVertFlex .textFitAlignVert{',
    'position: static;',
    '}'
  ].join('')

  const css = document.createElement('style')
  css.id = 'textFitStyleSheet'
  css.innerHTML = style
  document.body.appendChild(css)
}
