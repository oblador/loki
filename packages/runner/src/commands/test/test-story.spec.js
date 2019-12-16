const fs = require('fs-extra');
const { getImageDiffer } = require('./get-image-differ');
const testStory = require('./test-story');

jest.mock('fs-extra');
jest.mock('./get-image-differ');

const MOCK_SCREENSHOT = 'mock-screenshot';

beforeEach(jest.clearAllMocks);

describe('testStory', () => {
  const target = {
    captureScreenshotForStory: jest.fn(() => Promise.resolve(MOCK_SCREENSHOT)),
  };
  const tolerance = 'mock tolerance';
  const configuration = 'mock configuration';
  const configurationName = 'Configuration';
  const kind = 'Kind';
  const story = 'Story';
  const filename = `${configurationName}_${kind}_${story}.png`;

  const executeWithOptions = options =>
    testStory(
      target,
      options,
      tolerance,
      configuration,
      configurationName,
      kind,
      story
    );

  describe('reference image is missing', () => {
    beforeEach(() => {
      fs.pathExists.mockReturnValueOnce(Promise.resolve(false));
    });

    it('throws an error if requireReference option is true', async () => {
      const options = { requireReference: true };

      return expect(executeWithOptions(options)).rejects.toThrow(
        'No reference image found'
      );
    });

    it('adds reference image if requireReference option is false', async () => {
      const options = {
        requireReference: false,
        outputDir: `${__dirname}/outputDir`,
        referenceDir: `${__dirname}/referenceDir`,
        differenceDir: `${__dirname}/differenceDir`,
      };

      await executeWithOptions(options);

      const referencePath = `${options.referenceDir}/${filename}`;

      expect(target.captureScreenshotForStory).toHaveBeenCalledWith(
        kind,
        story,
        options,
        configuration
      );
      expect(fs.outputFile).toHaveBeenCalledWith(
        referencePath,
        MOCK_SCREENSHOT
      );
    });
  });

  describe('reference image is present', () => {
    beforeEach(() => {
      fs.pathExists.mockReturnValueOnce(Promise.resolve(true));
    });

    it('throws an error if image is different', async () => {
      getImageDiffer.mockReturnValue(() => Promise.resolve(false));
      const options = { updateReference: false };

      return expect(executeWithOptions(options)).rejects.toThrow(
        'Screenshot differs from reference'
      );
    });

    it("doesn't update the reference image", async () => {
      getImageDiffer.mockReturnValue(() => Promise.resolve(true));
      const options = {
        updateReference: false,
        requireReference: false,
        outputDir: `${__dirname}/outputDir`,
        referenceDir: `${__dirname}/referenceDir`,
        differenceDir: `${__dirname}/differenceDir`,
      };

      await executeWithOptions(options);

      const outputPath = `${options.outputDir}/${filename}`;

      expect(target.captureScreenshotForStory).toHaveBeenCalledWith(
        kind,
        story,
        options,
        configuration
      );
      expect(fs.outputFile).toHaveBeenCalledWith(outputPath, MOCK_SCREENSHOT);
    });
  });
});
