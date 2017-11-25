import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import Logo from '../src/Logo';
import * as AnimatedComponent from '../src/AnimatedComponent';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>)
  .add.skip('skipped story', () => <Button onClick={action('clicked')}>I am skipped</Button>);

storiesOf('Logo', module)
  .add('without delay', () => <Logo />)
  .add('with 15s delay', () => <Logo delay={15000} />);

storiesOf('Animation', module)
  .add('with CSS transition', () => <AnimatedComponent.CSSTransition />)
  .add('with CSS animation', () => <AnimatedComponent.CSSAnimation />)
  .add('with react-motion', () => <AnimatedComponent.ReactMotion />);
