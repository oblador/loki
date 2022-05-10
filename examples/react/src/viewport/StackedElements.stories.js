import React from 'react';

export default {
  title: 'Multiple elements',
};

export const StackedElements = (props) => [
  <div>There should be another element below</div>,
  <div>Hi, I&apos;m the other element</div>,
  <div>{props.footer}</div>,
];
StackedElements.storyName = 'Stacked elements';

export const WrappedStackedElements = () => (
  <div className="wrapper" style={{ border: '10px solid red' }}>
    <StackedElements footer="This works if not red border appears" />
  </div>
);
WrappedStackedElements.storyName = 'Stacked elements with a wrapper';

export const StackedInvisibleElements = () => [
  <div>There should not be other elements</div>,
  <div
    style={{
      visibility: 'hidden',
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      display: 'none',
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      opacity: 0,
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      width: 0,
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      height: 0,
    }}
  >
    This should not appear in the screenshot
  </div>,
];
StackedInvisibleElements.storyName = 'Invisible elements';
