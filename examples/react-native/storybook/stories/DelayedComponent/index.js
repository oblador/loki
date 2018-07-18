/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

export default class DelayedComponent extends Component {
  static propTypes = {
    delay: PropTypes.number,
    onDone: PropTypes.func,
  };

  static defaultProps = {
    delay: 1000,
    onDone: null,
  };

  state = { done: false };

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
    return <Text>{this.state.done ? 'Done!' : 'Loading…'}</Text>;
  }
}
