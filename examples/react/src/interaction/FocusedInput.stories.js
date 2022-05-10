import React from 'react';

export default {
  title: 'FocusedInput',
};

// eslint-disable-next-line jsx-a11y/no-autofocus
export const FocusedInput = () => <input type="text" autoFocus />;
FocusedInput.storyName = 'default';
