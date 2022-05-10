import React from 'react';
import './MediaAwareComponent.css';

export default {
  title: 'Media',
};

export const MediaAwareComponent = () => (
  <div className="MediaAwareComponent" />
);

MediaAwareComponent.storyName = 'with media queries';

export const FeaturesAwareComponent = () => (
  <div className="FeaturesAwareComponent" />
);

FeaturesAwareComponent.storyName = 'with color scheme queries';
