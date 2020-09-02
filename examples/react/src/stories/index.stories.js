import React from 'react';

import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import createAsyncCallback from '@loki/create-async-callback';

import { Welcome } from '@storybook/react/demo';
import Logo from '../Logo';
import * as AnimatedComponent from '../AnimatedComponent';
import DelayedComponent from '../DelayedComponent';
import CursiveText from '../CursiveText';
import MediaAwareComponent from '../MediaAwareComponent';
import StackedElements from '../StackedElements';
import StackedInvisibleElements from '../StackedInvisibleElements';
import LongElement from '../LongElement';
import NonIntViewport from '../NonIntViewport';
import FetchComponent from '../FetchComponent';
import ZeroHeightWithPadding from '../ZeroHeightWithPadding';
import Hover from '../Hover';
import FocusedInput from '../FocusedInput';
import IsLokiRunning, { withDisabledAnimations } from '../IsLokiRunning';

storiesOf('Welcome', module)
  .lokiSkip('to Storybook', () => <Welcome showApp={linkTo('Button')} />)
  .add('skipped', () => <Welcome showApp={linkTo('Button')} />, {
    loki: { skip: true },
  });

storiesOf('Text', module).add('with external font', () => (
  <CursiveText>Hello CursiveText</CursiveText>
));

storiesOf('Asynchronous render', module)
  .add('Logo without delay', () => <Logo />)
  .add('Logo with 1s delay', () => <Logo delay={1000} />)
  .lokiAsync('lokiAsync() with 1s delay', ({ done }) => (
    <DelayedComponent delay={1000} onDone={done} />
  ))
  .add('createAsyncCallback() with 1s delay', () => (
    <DelayedComponent delay={1000} onDone={createAsyncCallback()} />
  ));

storiesOf('Animation', module)
  .add('with CSS transition', () => <AnimatedComponent.CSSTransition />)
  .add('with CSS transition with will-change property', () => (
    <AnimatedComponent.CSSTransitionWillChange />
  ))
  .add('with CSS animation', () => <AnimatedComponent.CSSAnimation />)
  .add('with CSS animation on pseudo element', () => (
    <AnimatedComponent.CSSAnimationPseudoElement />
  ))
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

storiesOf('Long Element', module).add('default', () => <LongElement />);

storiesOf('Non-Int Viewport', module).add('default', () => (
  <NonIntViewport>
    <LongElement />
  </NonIntViewport>
));

storiesOf('Fetch Components', module).add('fetch fail', () => (
  <FetchComponent />
));

storiesOf('Zero height', module).add('with padding', () => (
  <ZeroHeightWithPadding />
));

storiesOf('Hover', module).add('default', () => <Hover />);

storiesOf('FocusedInput', module).add('default', () => <FocusedInput />);

storiesOf('isLokiRunning()', module)
  .addDecorator(withDisabledAnimations)
  .add('default', () => <IsLokiRunning />);
