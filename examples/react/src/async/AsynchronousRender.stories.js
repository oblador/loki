import React from 'react';
import createAsyncCallback from '@loki/create-async-callback';
import Logo from './Logo';
import DelayedComponent from './DelayedComponent';

export default {
  title: 'Asynchronous render',
};

export const LogoWithoutDelay = () => <Logo />;
LogoWithoutDelay.storyName = 'Logo without delay';

export const LogoWithDelay = () => <Logo delay={1000} />;
LogoWithDelay.storyName = 'Logo with 1s delay';

export const CreateAsyncCallbackWithDelay = () => (
  <DelayedComponent delay={1000} onDone={createAsyncCallback()} />
);
CreateAsyncCallbackWithDelay.storyName = 'createAsyncCallback() with 1s delay';
