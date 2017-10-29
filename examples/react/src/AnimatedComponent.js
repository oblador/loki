import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import './AnimatedComponent.css';

export class CSSTransition extends Component {
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
    this.interval = setInterval(toggle, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return (
      <div className={`AnimatedComponent CSSTransition ${this.state.on ? 'CSSTransition-on' : ''}`} />
    );
  }
}

export const CSSAnimation = () => (
  <div className="AnimatedComponent CSSAnimation" />
);

export const ReactMotion = () => (
  <Motion defaultStyle={{ rotate: 0 }} style={{ rotate: spring(360) }}>
    {value => (
      <div
        className="AnimatedComponent"
        style={{ transform: `rotate(${value.rotate}deg)` }}
      />
    )}
  </Motion>
);
