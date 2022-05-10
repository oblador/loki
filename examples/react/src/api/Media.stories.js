import React from 'react';
import './MediaAwareComponent.css';

export default {
  title: 'Media',
};

export const MediaAwareComponent = () => (
  <div className="MediaAwareComponent" />
);

MediaAwareComponent.storyName = 'with media queries';

export const LightSchemeComponent = () => (
  <div className="FeaturesAwareComponent" />
);

LightSchemeComponent.parameters = {
  loki: { features: [{ name: 'prefers-color-scheme', value: 'light' }] },
};

LightSchemeComponent.storyName = 'with light scheme queries';

export const DarkSchemeComponent = () => (
  <div className="FeaturesAwareComponent" />
);

DarkSchemeComponent.parameters = {
  loki: { features: [{ name: 'prefers-color-scheme', value: 'dark' }] },
};

DarkSchemeComponent.storyName = 'with dark scheme queries';
