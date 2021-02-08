/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs-extra');
const path = require('path');
const { die } = require('../../console');
const parseOptions = require('./parse-options');
const getConfig = require('../../config');

const isPNG = (file) => file.substr(-4) === '.png';

function approve(args) {
  const config = getConfig();
  const { outputDir, referenceDir } = parseOptions(args, config);

  const files = fs.readdirSync(outputDir).filter(isPNG);
  if (!files.length) {
    die(
      'No images found to approve',
      'Run update command to generate reference files instead'
    );
  }
  fs.emptyDirSync(referenceDir);
  fs.ensureDirSync(referenceDir);
  files.forEach((file) =>
    fs.moveSync(path.join(outputDir, file), path.join(referenceDir, file))
  );
}

module.exports = approve;
