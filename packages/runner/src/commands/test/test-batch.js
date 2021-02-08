const compareScreenshot = require('./compare-screenshot');

function testBatch(target, batch, options, tolerance) {
  if (target.captureScreenshotsForStories) {
    const resolvers = new Array(batch.length);
    const promises = batch.map(
      (_, i) =>
        new Promise((resolve, reject) => {
          resolvers[i] = [resolve, reject];
        })
    );
    target
      .captureScreenshotsForStories(batch, options)
      .then((screenshots) =>
        screenshots.forEach((screenshot, i) => {
          const [resolve, reject] = resolvers[i];
          if (screenshot instanceof Error) {
            reject(screenshot);
          } else {
            const task = batch[i];
            resolve(
              compareScreenshot(
                screenshot,
                options,
                tolerance,
                task.configurationName,
                task.kind,
                task.story
              )
            );
          }
        })
      )
      .catch((error) => resolvers.forEach(([, reject]) => reject(error)));
    return promises;
  }
  return batch.map(
    async ({
      configuration,
      configurationName,
      id,
      kind,
      story,
      parameters,
    }) => {
      const screenshot = await target.captureScreenshotForStory(
        id,
        options,
        configuration,
        parameters
      );
      return compareScreenshot(
        screenshot,
        options,
        tolerance,
        configurationName,
        kind,
        story
      );
    }
  );
}

module.exports = testBatch;
