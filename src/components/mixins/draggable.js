'use strict'
import ReactDOM from 'react-dom'
import lang from 'i18n/lang'

exports.componentWillMount = function () {
}

exports.componentDidMount = function () {
  this.mouseDownHdlrs && this.mouseDownHdlrs.push(this.onDraggableMouseDown)
}

exports.componentWillUnmount = function () {
  document.removeEventListener('mousemove', this.onDraggableMouseMove)
  document.removeEventListener('mouseup', this.onDraggableMouseUp)
}

exports.onDraggableMouseDown = function (ev) {
  // only left mouse button
  if (ev.button !== 0) return
  document.addEventListener('mousemove', this.onDraggableMouseMove)
  document.addEventListener('mouseup', this.onDraggableMouseUp)
  document.body.style.WebkitUserSelect = "none"
  document.body.style.MozUserSelect = "none"
  document.body.style.MsUserSelect = "none"

  this._draggable = {}
  this._draggable.drags = []
  this._draggable.dragged = false
  if(!this.selectedWidgets) {
    let slide = this.props.deck.getSelectedSlide()
    this.selectedWidgets = slide.components.reduce((pv, e, i, a)=> {
      if (e.selected) pv.push(i)
      return pv
    }, [])
  }
  this.selectedWidgets.forEach(e => {
    let computedStyle = window.getComputedStyle(ReactDOM.findDOMNode(this.refs[e]))
    let draggable = {}
    draggable.oleft = parseInt(computedStyle.left, 10) || 0
    draggable.otop = parseInt(computedStyle.top, 10) || 0
    draggable.ox = ev.pageX
    draggable.oy = ev.pageY
    this._draggable.drags[e] = draggable
  })

  ev.stopPropagation && ev.stopPropagation()
}

exports.onDraggableMouseMove = function (ev) {
  let scale = this.props.scale || 1
  this._draggable.dragged = true
  this.selectedWidgets.forEach(e=> {
    this.props.onSelectedWidgetUpdated && this.props.onSelectedWidgetUpdated(e, {
      x: this._draggable.drags[e].oleft + Math.round((ev.pageX - this._draggable.drags[e].ox) / scale),
      y: this._draggable.drags[e].otop + Math.round((ev.pageY - this._draggable.drags[e].oy) / scale)
    })
  })
  ev.stopPropagation && ev.stopPropagation()
}

exports.onDraggableMouseUp = function (ev) {
  document.body.style.WebkitUserSelect = ""
  document.body.style.MozUserSelect = ""
  document.body.style.MsUserSelect = ""
  document.removeEventListener('mousemove', this.onDraggableMouseMove)
  document.removeEventListener('mouseup', this.onDraggableMouseUp)
  let scale = this.props.scale || 1

  this.selectedWidgets.forEach(e=> {
    this.props.onSelectedWidgetUpdated && this.props.onSelectedWidgetUpdated(e, {
        x: this._draggable.drags[e].oleft + Math.round((ev.pageX - this._draggable.drags[e].ox) / scale),
        y: this._draggable.drags[e].otop + Math.round((ev.pageY - this._draggable.drags[e].oy) / scale)
      }, this._draggable.dragged && lang.moveComponents
    )
  })
  ev.stopPropagation && ev.stopPropagation()
}

