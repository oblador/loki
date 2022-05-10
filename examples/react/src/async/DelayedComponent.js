/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class DelayedComponent extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { done: false };
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({ done: true });
      if (this.props.onDone) {
        this.props.onDone();
      }
    }, this.props.delay);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    return <div>{this.state.done ? 'Done!' : 'Loading…'}</div>;
  }
}

DelayedComponent.propTypes = {
  delay: PropTypes.number,
  onDone: PropTypes.func,
};

DelayedComponent.defaultProps = {
  delay: 1000,
  onDone: null,
};
