import React from 'react';
import './story.css';

export default { title: 'Compatibility/Button' };

const button = (label) =>
  React.createElement(
    'button',
    {
      type: 'button',
      id: 'compat-button',
      className: 'compat-button',
      style: { backgroundImage: 'url(/fixture.svg)' },
    },
    label
  );

export const Primary = () => button('Button');
export const Secondary = () => button('Other');
export const Skipped = () => React.createElement('div', {}, 'Skipped');
Skipped.parameters = { loki: { skip: true } };
