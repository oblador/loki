const React = require('react');
const { Box, Color } = require('ink');

const FailedTest = ({ title, error }) => (
  <Box marginLeft={7} flexDirection="column">
    <Color>{title}</Color>
    <Color red>{error.message}</Color>
    {error.instructions && <Color dim>{error.instructions}</Color>}
  </Box>
);

module.exports = FailedTest;
