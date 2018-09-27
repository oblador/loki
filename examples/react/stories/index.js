import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import Logo from '../src/Logo';
import * as AnimatedComponent from '../src/AnimatedComponent';
import DelayedComponent from '../src/DelayedComponent';
import CursiveText from '../src/CursiveText';
import MediaAwareComponent from '../src/MediaAwareComponent';
import StackedElements from '../src/StackedElements';
import StackedInvisibleElements from '../src/StackedInvisibleElements';

storiesOf('Welcome', module).add('to Storybook', () => (
  <Welcome showApp={linkTo('Button')} />
));

storiesOf('Text', module).add('with external font', () => (
  <CursiveText>Hello CursiveText</CursiveText>
));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ))
  .lokiSkip('lokiSkip story', () => (
    <Button onClick={action('clicked')}>I am skipped</Button>
  ))
  .add.skip('add.skip story', () => (
    <Button onClick={action('clicked')}>I am skipped</Button>
  ));

storiesOf('Asynchronous render', module)
  .add('Logo without delay', () => <Logo />)
  .add('Logo with 1s delay', () => <Logo delay={1000} />)
  .lokiAsync('lokiAsync() with 1s delay', ({ done }) => (
    <DelayedComponent delay={1000} onDone={done} />
  ))
  .add.async('add.async() with 1s delay', ({ done }) => (
    <DelayedComponent delay={1000} onDone={done} />
  ));

storiesOf('Animation', module)
  .add('with CSS transition', () => <AnimatedComponent.CSSTransition />)
  .add('with CSS animation', () => <AnimatedComponent.CSSAnimation />)
  .add('with react-motion', () => <AnimatedComponent.ReactMotion />);

storiesOf('Media', module).add('with media queries', () => (
  <MediaAwareComponent />
));

storiesOf('Multiple elements', module)
  .add('Stacked elements', () => <StackedElements />)
  .add('Stacked elements with a wrapper', () => (
    <div className="wrapper" style={{ border: '10px solid red' }}>
      <StackedElements footer="This works if not red border appears" />
    </div>
  ))
  .add('Invisible elements', () => <StackedInvisibleElements />);
