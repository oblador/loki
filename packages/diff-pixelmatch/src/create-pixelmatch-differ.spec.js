const fs = require('fs-extra');
const path = require('path');
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
    const darkGrayBase64String =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2NISUn5DwAEiAIshLJN6AAAAABJRU5ErkJggg==';
    writeBase64Image({
      outputPath: darkGrayPath,
      base64String: darkGrayBase64String,
    });
    const lightGrayBase64String =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2M4ceLEfwAIDANYMDoQswAAAABJRU5ErkJggg==';
    writeBase64Image({
      outputPath: lightGrayPath,
      base64String: lightGrayBase64String,
    });
  });

  afterEach(() => {
    fs.rmdirSync(workingDirectory, { recursive: true });
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
});
