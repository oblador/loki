let loadingImages = [];

export const registerImageLoading = promise => {
  loadingImages.push(promise);
};

export const resetLoadingImages = () => {
  loadingImages = [];
};

export const awaitImagesLoaded = (timeout = 5000) => {
  let cancel;
  const promise = new Promise((resolve, reject) => {
    const timer = setTimeout(reject, timeout);
    let canceled = false;
    cancel = () => {
      clearTimeout(timer);
      canceled = true;
    };
    Promise.all(loadingImages).then(result => {
      if (!canceled) {
        clearTimeout(timer);
        // Resolve on next frame to avoid some race conditions
        setTimeout(() => resolve(result.length), 0);
      }
    });
  });
  promise.cancel = cancel;
  return promise;
};
