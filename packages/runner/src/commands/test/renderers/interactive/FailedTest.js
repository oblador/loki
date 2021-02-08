const React = require('react');
const { Box, Text } = require('ink');

const FailedTest = ({ title, error }) => (
  <Box marginLeft={7} flexDirection="column">
    <Text>{title}</Text>
    <Text color="red">{error.message}</Text>
    {Boolean(error.instructions) && <Text dimColor>{error.instructions}</Text>}
  </Box>
);

module.exports = FailedTest;
