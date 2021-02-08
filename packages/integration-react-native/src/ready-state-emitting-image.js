/* eslint-disable react/jsx-props-no-spreading */
/**
 * This replaces the React Native Image component to register when it's finished
 * loading to avoid race conditions in visual tests.
 */
const React = require('react');
const Image = require('react-native/Libraries/Image/Image');
const hoistNonReactStatics = require('hoist-non-react-statics');
const { registerPendingPromise } = require('./ready-state-manager');

const IMAGE_LOAD_TIMEOUT = 20000;

class ReadyStateEmittingImage extends React.Component {
  constructor(props) {
    super(props);

    if (props.source) {
      registerPendingPromise(
        new Promise((resolve, reject) => {
          this.resolve = (value) => {
            resolve(value);
            clearTimeout(this.timer);
          };
          this.timer = setTimeout(() => {
            const url = props.source.uri;
            const message = `Image "${url}" failed to load within ${IMAGE_LOAD_TIMEOUT}ms`;
            reject(new Error(message));
          }, IMAGE_LOAD_TIMEOUT);
        })
      );
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  setNativeProps = (...args) => {
    this.ref.setNativeProps(...args);
  };

  handleRef = (ref) => {
    this.ref = ref;
  };

  handleLoadEnd = (e) => {
    if (this.resolve) {
      this.resolve();
      this.resolve = null;
    }
    const { onLoadEnd } = this.props;
    if (onLoadEnd) {
      onLoadEnd(e);
    }
  };

  render() {
    return (
      <Image
        {...this.props}
        ref={this.handleRef}
        fadeDuration={0}
        onLoadEnd={this.handleLoadEnd}
      />
    );
  }
}

ReadyStateEmittingImage.propTypes = Image.propTypes;

hoistNonReactStatics(ReadyStateEmittingImage, Image);

module.exports = ReadyStateEmittingImage;
