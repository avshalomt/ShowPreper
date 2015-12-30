'use strict'
import _ from 'lodash'
const _spDefaultFileNm = 'default.json'
import 'babel-polyfill'
import SampleDeck from "sources/sample.json"
const DEFAULT_SLIDE_SIZE = {width: 640, height: 480}

let Deck = function () {
  var defaultDeckObj
  if (typeof(Storage) !== "undefined") {
    try {
      defaultDeckObj = JSON.parse(localStorage.getItem(_spDefaultFileNm))
    }
    catch (ex) {
    }
  }
  if (defaultDeckObj && typeof(defaultDeckObj) === 'object') {
    _.assign(this, defaultDeckObj)
  }
  else {
    _.assign(this, SampleDeck)
    this.save()
  }

  Object.defineProperty(this, "undoStack", {
    enumerable: false,
    value: {
      stack: [],
      current: -1
    }
  })
  this.markUndo('')
}

Deck.prototype.getActiveSlide = function () {
  return this.getSlides()[this.activeSlide || 0]
}

Deck.prototype.activateSlide = function (i) {
  this.activeSlide = i
}

Deck.prototype.save = function () {
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(_spDefaultFileNm, JSON.stringify(this))
  }
}

Deck.prototype.markUndo = function (desc) {
  this.undoStack.stack.splice(++this.undoStack.current, this.undoStack.stack.length, {
    desc: desc,
    deck: _.cloneDeep(this)
  })
}

Deck.prototype.undo = function () {
  (this.undoStack.current > 0) && _.assign(this, _.cloneDeep(this.undoStack.stack[--this.undoStack.current].deck))
}

Deck.prototype.redo = function () {
  ((this.undoStack.current + 1) < this.undoStack.stack.length) && _.assign(this, _.cloneDeep(this.undoStack.stack[++this.undoStack.current].deck))
}
Deck.prototype.getSlides = function () {
  return this.components.filter((e, i, a)=>e.type === 'Slide')
}
Deck.prototype.getSlideBoundingBox = function (e, i) {
  let nCols = Math.ceil(Math.sqrt(this.getSlides().length))
  // assume square grid layout
  let slideWidth = this.slideWidth || DEFAULT_SLIDE_SIZE.width
  let slideHeight = this.slideHeight || DEFAULT_SLIDE_SIZE.height
  let slideMargin = Math.min(slideWidth, slideHeight) * 0.1
  let row = Math.floor(i / nCols)
  let col = i % nCols
  let left = e.x || (slideWidth + slideMargin) * col
  let right = left + slideWidth
  let top = e.y || (slideHeight + slideMargin) * row
  let bottom = top + slideHeight
  return {top: top, right: right, bottom: bottom, left: left}
}

Deck.prototype.getDefaultDeckBoundingBox = function () {
  return this.getSlides().reduce((pv, e, i, a) => {
    let bb = this.getSlideBoundingBox(e, i)
    pv = pv || {top: bb.top, right: bb.right, bottom: bb.bottom, left: bb.left}
    return {
      top: Math.min(bb.top, pv.top)
      , right: Math.max(bb.right, pv.right)
      , bottom: Math.max(bb.bottom, pv.bottom)
      , left: Math.min(bb.left, pv.left)
    }
  }, null)
}


exports.getDefaultDeck = function () {
  return new Deck()
}
