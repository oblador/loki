const React = require('react');
const { Box, Color } = require('ink');

const FailedTest = ({ title, error }) => (
  <Box marginLeft={7} flexDirection="column">
    <Color>{title}</Color>
    <Color dim>{error.message}</Color>
  </Box>
);

module.exports = FailedTest;
