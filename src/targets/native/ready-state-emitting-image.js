/**
 * This replaces the React Native Image component to register when it's finished
 * loading to avoid race conditions in visual tests.
 */
const React = require('react');
const Image = require('react-native/Libraries/Image/Image');
const { registerImageLoading } = require('./ready-state-manager');

class ReadyStateEmittingImage extends React.Component {
  constructor(props) {
    super(props);

    if (props.source) {
      registerImageLoading(
        new Promise(resolve => {
          this.resolve = resolve;
        }),
        props.source
      );
    }
  }

  setNativeProps = (...args) => {
    this.ref.setNativeProps(...args);
  };

  handleRef = ref => {
    this.ref = ref;
  };

  handleLoadEnd = e => {
    if (this.resolve) {
      this.resolve();
      this.resolve = null;
    }
    if (this.props.onLoadEnd) {
      this.props.onLoadEnd(e);
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
ReadyStateEmittingImage.prefetch = Image.prefetch;
ReadyStateEmittingImage.getSize = Image.getSize;

module.exports = ReadyStateEmittingImage;
