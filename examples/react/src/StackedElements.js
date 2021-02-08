import React from 'react';

const StackedElements = (props) => [
  <div>There should be another element below</div>,
  <div>Hi, I&apos;m the other element</div>,
  <div>{props.footer}</div>,
];
export default StackedElements;
