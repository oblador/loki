import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import './AnimatedComponent.css';

const withAlternatingState = (WrappedComponent, interval = 1000) =>
  class AlternatingStateComponent extends Component {
    constructor(props) {
      super(props);
      this.state = { on: false };
    }

    componentDidMount() {
      const toggle = () =>
        this.setState(state => ({
          on: !state.on,
        }));
      setTimeout(toggle, 1);
      this.interval = setInterval(toggle, interval);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    render = () => <WrappedComponent on={this.state.on} />;
  };

export const CSSTransition = withAlternatingState(({ on }) => (
  <div className={`AnimatedComponent CSSTransition ${on ? 'CSSTransition-on' : ''}`} />
));

export const CSSAnimation = () => (
  <div className="AnimatedComponent CSSAnimation" />
);

export const ReactMotion = withAlternatingState(({ on }) => (
  <Motion defaultStyle={{ rotate: 45 }} style={{ rotate: spring(on ? 0 : 45) }}>
    {value => (
      <div
        className="AnimatedComponent"
        style={{ transform: `rotate(${value.rotate}deg)` }}
      />
    )}
  </Motion>
));
