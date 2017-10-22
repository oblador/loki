let loadingImages = [];

export const registerImageLoading = (promise, source) => {
  const image = { promise, source, loaded: false };
  promise.then(() => {
    image.loaded = true;
  });
  loadingImages.push(image);
};

export const resetLoadingImages = () => {
  loadingImages = [];
};

export const awaitImagesLoaded = (timeout = 10000) => {
  let cancel;
  const promise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const failedURLs = loadingImages
        .filter(i => !i.loaded)
        .map(i => i.source && i.source.uri);
      const noun = failedURLs.length === 1 ? 'image' : 'images';
      const errorMessage = `${failedURLs.length} ${noun} failed to load within ${timeout}ms; ${failedURLs.join(
        ', '
      )}`;
      reject(new Error(errorMessage));
    }, timeout);
    let canceled = false;
    cancel = () => {
      clearTimeout(timer);
      canceled = true;
    };
    Promise.all(loadingImages.map(i => i.promise)).then(result => {
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
