/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import { configure } from '@storybook/react';
import 'loki/configure-react';

function loadStories() {
  require('../src/stories');
}

configure(loadStories, module);
