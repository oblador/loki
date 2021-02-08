const getStorybookError = (window) => {
  const errorElement = window.document.querySelector(
    '.sb-show-errordisplay #error-message'
  );
  if (errorElement) {
    return errorElement.innerText;
  }
  return null;
};

module.exports = getStorybookError;
