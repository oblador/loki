import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import Logo from '../src/Logo';
import * as AnimatedComponent from '../src/AnimatedComponent';
import DelayedComponent from '../src/DelayedComponent';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>)
  .add.skip('skipped story', () => <Button onClick={action('clicked')}>I am skipped</Button>);

storiesOf('Asynchronous render', module)
  .add('Logo without delay', () => <Logo />)
  .add('Logo with 1s delay', () => <Logo delay={1000} />)
  .add.async('add.async() with 1s delay', ({ done }) =>
    <DelayedComponent delay={1000} onDone={done} />
  );

storiesOf('Animation', module)
  .add('with CSS transition', () => <AnimatedComponent.CSSTransition />)
  .add('with CSS animation', () => <AnimatedComponent.CSSAnimation />)
  .add('with react-motion', () => <AnimatedComponent.ReactMotion />);
