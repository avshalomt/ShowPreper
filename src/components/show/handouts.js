'use strict'
import React from 'react'
import ReactDOM from 'react-dom'
import DeckStore from 'stores/deck'
import './handouts.less'
var DisplayableComponent = require('components/widgets/displayableComponent')
let Handouts = React.createClass({
  getInitialState: () => ({
    deck: DeckStore.getDefaultDeck()
  }),
  render: function () {
    let deckView = this.state.deck.components.map((component, index) => {
      if (component.type === 'Slide') {
        let bb = this.state.deck.getSlideBoundingBox(component)
        // don't transform slides
        delete component.x
        delete component.y
        delete component.z
        delete component.scale
        delete component.rotate
        delete component.skew

        component.width = bb.right - bb.left
        component.height = bb.bottom - bb.top
      }
      return (
        <DisplayableComponent
          ownClassName="slide"
          component={component}
          componentStyle={component.style || this.state.deck.defaultSlideStyle || {}}
          container={this.state.deck}
          key={index}
          idx={index}
          ref={index}
          combinedTransform={true}
        />
      )
    })
    return <div className="handouts">{deckView}</div>
  }
})

// Render the main component into the dom
ReactDOM.render(<Handouts />, document.getElementById('app'))
