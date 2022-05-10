import React from 'react';

import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';

import { Welcome } from '@storybook/react/demo';
import IsLokiRunning, { withDisabledAnimations } from './IsLokiRunning';

storiesOf('Welcome', module).add(
  'skipped',
  () => <Welcome showApp={linkTo('Button')} />,
  {
    loki: { skip: true },
  }
);

storiesOf('isLokiRunning()', module)
  .addDecorator(withDisabledAnimations)
  .add('default', () => <IsLokiRunning />);
