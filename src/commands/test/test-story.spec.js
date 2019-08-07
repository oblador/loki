const fs = require('fs-extra');
const { getImageDiffer } = require('../../diffing');
const testStory = require('./test-story');

jest.mock('fs-extra');
jest.mock('../../diffing');

describe('testStory', () => {
  const target = { captureScreenshotForStory: jest.fn() };
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

  beforeEach(target.captureScreenshotForStory.mockReset);

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
        outputFilenamesLowercase: false,
        outputDir: `${__dirname}/outputDir`,
        referenceDir: `${__dirname}/referenceDir`,
        differenceDir: `${__dirname}/differenceDir`,
      };

      await executeWithOptions(options);

      const referencePath = `${options.referenceDir}/${filename}`;

      expect(target.captureScreenshotForStory).toHaveBeenCalledWith(
        kind,
        story,
        referencePath,
        options,
        configuration
      );
    });

    it('output filename is lowercase if outputFilenamesLowercase is set to true', async () => {
      const options = {
        outputFilenamesLowercase: true,
        requireReference: false,
        outputDir: `${__dirname}/outputDir`,
        referenceDir: `${__dirname}/referenceDir`,
        differenceDir: `${__dirname}/differenceDir`,
      };

      await executeWithOptions(options);

      const referencePath = `${
        options.referenceDir
      }/configuration_kind_story.png`;

      expect(target.captureScreenshotForStory).toHaveBeenCalledWith(
        kind,
        story,
        referencePath,
        options,
        configuration
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
        outputFilenamesLowercase: false,
        outputDir: `${__dirname}/outputDir`,
        referenceDir: `${__dirname}/referenceDir`,
        differenceDir: `${__dirname}/differenceDir`,
      };

      await executeWithOptions(options);

      const outputPath = `${options.outputDir}/${filename}`;

      expect(target.captureScreenshotForStory).toHaveBeenCalledWith(
        kind,
        story,
        outputPath,
        options,
        configuration
      );
    });
  });
});
