const React = require('react');
const { Box, Text } = require('ink');
const {
  STATUS_NOT_STARTED,
  STATUS_RUNNING,
  STATUS_SUCCEEDED,
  STATUS_FAILED,
} = require('../../task-runner');

const STATUS_CONFIGURATION_MAP = {
  [STATUS_NOT_STARTED]: {
    title: 'WAIT',
    color: 'grey',
  },
  [STATUS_RUNNING]: {
    title: 'RUNS',
    color: 'yellow',
  },
  [STATUS_SUCCEEDED]: {
    title: 'PASS',
    color: 'green',
  },
  [STATUS_FAILED]: {
    title: 'FAIL',
    color: 'red',
  },
};

const Status = ({ status }) => {
  const { color, title } = STATUS_CONFIGURATION_MAP[status];
  return <Text backgroundColor={color} bold color="#fff">{` ${title} `}</Text>;
};

const Task = ({ status, prefix, title }) => (
  <Box>
    <Status status={status} />
    <Box marginLeft={1}>
      <Text dimColor>{prefix}</Text>
      <Text bold>{title}</Text>
    </Box>
  </Box>
);

module.exports = React.memo(Task);
