import React from 'react';
import { Motion, spring } from 'react-motion';
import './AnimatedComponent.css';

export default {
  title: 'Animation',
};

const withAlternatingState =
  (WrappedComponent, interval = 1000) =>
  () => {
    const [on, toggle] = React.useReducer((state) => !state, false);
    React.useEffect(() => {
      const timer = setInterval(toggle, interval);
      setTimeout(toggle, 1);
      return () => clearInterval(timer);
    }, [toggle]);
    return <WrappedComponent on={on} />;
  };

export const CSSTransition = withAlternatingState(({ on }) => (
  <div
    className={`AnimatedComponent CSSTransition ${
      on ? 'CSSTransition-on' : ''
    }`}
  />
));
CSSTransition.storyName = 'with CSS transition';

export const CSSTransitionWillChange = withAlternatingState(({ on }) => (
  <div
    className={`AnimatedComponent CSSTransition CSSTransitionWillChange ${
      on ? 'CSSTransition-on' : ''
    }`}
  />
));
CSSTransitionWillChange.storyName =
  'with CSS transition with will-change property';

export const CSSAnimationPseudoElement = () => (
  <div className="AnimatedComponent AnimatedPseudoElement" />
);
CSSAnimationPseudoElement.storyName = 'with CSS animation on pseudo element';

export const CSSAnimation = () => (
  <div className="AnimatedComponent CSSAnimation" />
);
CSSAnimation.storyName = 'with CSS animation';

export const ReactMotion = withAlternatingState(({ on }) => (
  <Motion defaultStyle={{ rotate: 45 }} style={{ rotate: spring(on ? 0 : 45) }}>
    {(value) => (
      <div
        className="AnimatedComponent"
        style={{ transform: `rotate(${value.rotate}deg)` }}
      />
    )}
  </Motion>
));
ReactMotion.storyName = 'with react-motion';
