export default ErrorThrowingComponent = () => {
  throw new Error('This error should be caught by loki');
};
