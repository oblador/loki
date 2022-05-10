import React from 'react';

const Box = ({ color }) => (
  <div style={{ width: 100, height: 100, background: color }} />
);

export default {
  component: Box,
  title: 'CSF',
};

export const Error404 = () => <Box color="blue" />;
Error404.storyName = '404 Error';

export const TODO = () => <Box color="green" />;
TODO.storyName = '@TODO';

export const Skipped = () => <Box color="red" />;
Skipped.parameters = { loki: { skip: true } };
