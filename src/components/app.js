'use strict'
import 'normalize.css'
import 'expose?$!expose?jQuery!jquery'
import 'bootstrap-webpack'
import './app.less'
import lang from 'i18n/lang'
import React from 'react'
import Header from './header'
import Slides from './slides'
import Overview from './overview'
import DeckStore from 'stores/deck'
import _ from 'lodash'
let key = require('mousetrap')
let App = React.createClass({
  setDocTitle: t => {
    document.title = "ShowPreper - " + t
  },
  componentWillMount: function () {
    this.setDocTitle(this.state.deck._fn)
  },
  componentDidMount: function () {
    key.bind('ctrl+z', this.onUndo)
    key.bind('ctrl+y', this.onRedo)
    key.bind('del', this.deleteWidgets)
    key.bind('left', ()=>this.panBy("x", -1), "keydown")
    key.bind('left', ()=>this.panBy("x", 0, lang.moveComponents), "keyup")
    key.bind('shift+left', ()=>this.panBy("x", -10), "keydown")
    key.bind('shift+left', ()=> {
      this.panBy("x", 0, lang.moveComponents)
    }, "keyup")
    key.bind('right', ()=>this.panBy("x", 1), "keydown")
    key.bind('right', ()=>this.panBy("x", 0, lang.moveComponents), "keyup")
    key.bind('shift+right', ()=>this.panBy("x", 10), "keydown")
    key.bind('shift+right', ()=> {
      this.panBy("x", 0, lang.moveComponents)
    }, "keyup")
    key.bind('up', ()=>this.panBy("y", -1), "keydown")
    key.bind('up', ()=>this.panBy("y", 0, lang.moveComponents), "keyup")
    key.bind('shift+up', ()=>this.panBy("y", -10), "keydown")
    key.bind('shift+up', ()=> {
      this.panBy("y", 0, lang.moveComponents)
    }, "keyup")
    key.bind('down', ()=>this.panBy("y", 1), "keydown")
    key.bind('down', ()=>this.panBy("y", 0, lang.moveComponents), "keyup")
    key.bind('shift+down', ()=>this.panBy("y", 10), "keydown")
    key.bind('shift+down', ()=> {
      this.panBy("y", 0, lang.moveComponents)
    }, "keyup")
  },
  getInitialState: () => ({
    deck: DeckStore.getDefaultDeck(),
    view: 'slides',
    presentationStyle: null,
    defaultSlideStyle: null,
    selectedSlidesStyle: null,
    thisSlideStyle: null
  }),
  changeView: function (newView) {
    this.setState({
        view: newView
      }
    )
  },
  onSlideClicked: function (i) {
    let deck = this.state.deck
    deck.activateSlide(i)
    deck.save()
    this.setState({
      deck: deck
    })
  },
  onNewWidget: function (container, index, newProps, markUndoDesc) {
    let startIdx = (Number.isInteger(index)) ? index : container.components.length
    container.components.splice(startIdx, 0, newProps || {})
    let deck = this.state.deck
    deck.save()
    if (markUndoDesc) {
      deck.markUndo(markUndoDesc)
    }
    this.setState({
      deck: deck
    })
  },
  onSelectedWidgetUpdated: function (widget, newProps, markUndoDesc) {
    let component, widgetIdx
    let deck = this.state.deck
    switch (typeof(widget)) {
      case 'number':
        component = deck.getActiveSlide()
        widgetIdx = widget
        break
      case 'object':
        component = widget.container
        widgetIdx = widget.index
        break
    }
    let selectedWidget = (widgetIdx >= 0) ? component.components[widgetIdx] : component
    switch (typeof newProps) {
      case 'object':
        if (newProps) {
          _.assign(selectedWidget, newProps)
        }
        // null
        else {
          component.components.splice(widgetIdx, 1)
        }
        break
      case 'string':
        delete selectedWidget[newProps]
        break
      case 'undefined':
        component.components.splice(widgetIdx, 1)
        break
    }
    deck.save()
    if (markUndoDesc) {
      deck.markUndo(markUndoDesc)
    }
    this.setState({
      deck: deck
    })
  },
  onNewDeck: function (nm, props) {
    let deck = new DeckStore.Deck(nm, props)
    deck.save()
    this.setState({
      deck: deck
    })
  },
  onDeleteDeck: function () {
    this.state.deck.delete()
    let deck = DeckStore.getDefaultDeck()
    deck.save()
    this.setState({
      deck: deck
    })
  },
  onUndo: function () {
    let deck = this.state.deck
    deck.undo()
    deck.save()
    this.setState({
      deck: deck
    })
  },

  onRedo: function () {
    let deck = this.state.deck
    deck.redo()
    deck.save()
    this.setState({
      deck: deck
    })
  },
  onSlideMoved: function (from, to) {
    let deck = this.state.deck
    let slides = deck.getSlides()
    let indexOfFrom = deck.components.indexOf(slides[from])
    let indexOfTo = deck.components.indexOf(slides[to])
    let slidesBeingMoved = deck.components.splice(indexOfFrom, 1)
    deck.components.splice(indexOfTo, 0, slidesBeingMoved[0])
    deck.save()
    this.setState({
      deck: deck
    })
  },
  deleteWidgets: function () {
    let deck = this.state.deck
    let component
    switch (this.state.view) {
      case 'slides':
        component = deck.getActiveSlide()
        break
      case 'overview':
        component = deck
        break
    }
    let i = component.components.length
    let hasDeletedSomething = false
    while (i > 0) {
      --i
      let e = component.components[i]
      if (e.selected) {
        this.onSelectedWidgetUpdated({
          container: component,
          index: i
        })
        hasDeletedSomething = true
      }
    }
    if (hasDeletedSomething) {
      deck.markUndo(lang.delete)
      this.setState({
        deck: deck
      })
    }
  },
  panBy: function (axis, delta, markUndoDesc) {
    let deck = this.state.deck
    let component
    switch (this.state.view) {
      case 'slides':
        component = deck.getActiveSlide()
        break
      case 'overview':
        component = deck
        break
    }
    let selectedWidgets = component.components.reduce((pv, e, i)=> {
      if (e.selected) pv.push(i)
      return pv
    }, [])
    selectedWidgets.forEach(e=> {
      let newProp = {}
      newProp[axis] = component.components[e][axis] + delta
      this.onSelectedWidgetUpdated({container: component, index: e}, newProp, markUndoDesc)
    })
  },
  componentWillUpdate: function (nextProps, nextState) {
    if (nextState.deck._fn !== this.state.deck._fn) {
      this.setDocTitle(nextState.deck._fn)
    }
  },
  setTargetStyle: function (target, style) {
    let tmp = {}
    // have to double apply style because react seems cannot
    // handle background and background-color together correctly
    tmp[target] = {}
    this.setState(tmp, ()=> {
      tmp[target] = style
      this.setState(tmp)
    })
  },
  render: function () {
    var Main
    switch (this.state.view) {
      case 'slides':
        Main = <Slides deck={this.state.deck}
                       onSlideClicked={this.onSlideClicked}
                       onSelectedWidgetUpdated={this.onSelectedWidgetUpdated}
                       onNewWidget={this.onNewWidget}
                       onSlideMoved={this.onSlideMoved}
                       defaultSlideStyle={this.state.defaultSlideStyle}
                       thisSlideStyle={this.state.thisSlideStyle}
        />
        break;
      case 'overview':
        let selectedWidgets = this.state.deck.components.reduce((pv, e, i)=> {
          if (e.selected) pv.push(i)
          return pv
        }, [])
        Main = <Overview
          deck={this.state.deck}
          component={this.state.deck}
          selectedWidgets={selectedWidgets}
          onSelectedWidgetUpdated={this.onSelectedWidgetUpdated}
          presentationStyle={this.state.presentationStyle}
          defaultSlideStyle={this.state.defaultSlideStyle}
          selectedSlidesStyle={this.state.selectedSlidesStyle}
        />
    }
    return <div className="sp-main-container">
      <Header deck={this.state.deck}
              onUndo={this.onUndo}
              onRedo={this.onRedo}
              changeView={this.changeView}
              currentView={this.state.view}
              onNewWidget={this.onNewWidget}
              onNewDeck={this.onNewDeck}
              onDeleteDeck={this.onDeleteDeck}
              presentationStyle={this.state.presentationStyle}
              defaultSlideStyle={this.state.defaultSlideStyle}
              selectedSlidesStyle={this.state.selectedSlidesStyle}
              thisSlideStyle={this.state.thisSlideStyle}
              setTargetStyle={this.setTargetStyle}
              onSelectedWidgetUpdated={this.onSelectedWidgetUpdated}
      />
      {Main}
    </div>
  }
})

module.exports = App
