const fs = require('fs-extra');
const path = require('path');
const { PNG } = require('pngjs');
const createPixelmatchDiffer = require('./create-pixelmatch-differ');

const workingDirectory = `./pixelmatch-${Math.round(Math.random() * 1000)}`;
const darkGrayPath = path.join(workingDirectory, 'dark-dray.png');
const lightGrayPath = path.join(workingDirectory, 'light-dray.png');

function writeBase64Image({ outputPath, base64String }) {
  const imageData = base64String.split(';base64,').pop();

  fs.ensureFileSync(outputPath);
  fs.writeFileSync(outputPath, imageData, { encoding: 'base64' });
}

describe('createPixelmatchDiffer', () => {
  beforeEach(() => {
    // 1x1 png picture
    const darkGrayBase64String =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2NISUn5DwAEiAIshLJN6AAAAABJRU5ErkJggg==';
    writeBase64Image({
      outputPath: darkGrayPath,
      base64String: darkGrayBase64String,
    });
    // 1x1 png picture
    const lightGrayBase64String =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2M4ceLEfwAIDANYMDoQswAAAABJRU5ErkJggg==';
    writeBase64Image({
      outputPath: lightGrayPath,
      base64String: lightGrayBase64String,
    });
  });

  afterEach(() => {
    fs.rmSync(workingDirectory, { recursive: true });
  });

  it('creates diff files in deeply nested directories', async () => {
    const config = {};
    const pixelmatchDiffer = createPixelmatchDiffer(config);

    const diffPath = path.join(
      workingDirectory,
      'deeply',
      'nested',
      'diff.png'
    );
    const tolerance = 0;
    await pixelmatchDiffer(darkGrayPath, lightGrayPath, diffPath, tolerance);

    expect(fs.existsSync(diffPath)).toEqual(true);
  });

  it('should output only the diff image by default', async () => {
    const config = {};
    const diffPath = path.join(workingDirectory, 'diff.png');
    const pixelmatchDiffer = createPixelmatchDiffer(config);
    const tolerance = 0;
    await pixelmatchDiffer(darkGrayPath, lightGrayPath, diffPath, tolerance);
    const outputPNG = PNG.sync.read(fs.readFileSync(diffPath));
    expect(outputPNG).toEqual(
      expect.objectContaining({
        width: 1,
        height: 1,
      })
    );
  });
  it('should be able to save the image with previous and current version along with diff', async () => {
    const config = {};
    const diffPath = path.join(workingDirectory, 'diff.png');
    const pixelmatchDiffer = createPixelmatchDiffer(config, true);
    const tolerance = 0;
    await pixelmatchDiffer(darkGrayPath, lightGrayPath, diffPath, tolerance);
    const outputPNG = PNG.sync.read(fs.readFileSync(diffPath));
    expect(outputPNG).toEqual(
      expect.objectContaining({
        width: 3,
        height: 1,
      })
    );
  });
});
