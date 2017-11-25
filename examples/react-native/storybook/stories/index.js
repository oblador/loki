/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import React from 'react';
import { Text } from 'react-native';

import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import Button from './Button';
import CenterView from './CenterView';
import Welcome from './Welcome';
import Logo from './Logo';
import ErrorThrowingComponent from './ErrorThrowingComponent';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('with text', () =>
    <Button onPress={action('clicked-text')}>
      <Text>Hello Button</Text>
    </Button>
  )
  .add('with some emoji', () =>
    <Button onPress={action('clicked-emoji')}>
      <Text>😀 😎 👍 💯</Text>
    </Button>
  )
  .add.skip('skipped story', () =>
    <Button onPress={action('clicked-emoji')}>
      <Text>I am skipped</Text>
    </Button>
  );

storiesOf('Logo', module)
  .add('without delay', () => <Logo />)
  .add('with 15s delay', () => <Logo delay={15000} />);

storiesOf('Error Handling', module)
  .add('with ErrorThrowingComponent', () => <ErrorThrowingComponent />)
  .add('with console.warn', () => {
    console.warn('This warning should not show up in the screenshot');
    return <Text>This story emits a console.warn</Text>;
  });
