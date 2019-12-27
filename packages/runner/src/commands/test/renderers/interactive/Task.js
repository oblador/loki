const React = require('react');
const { Box, Color } = require('ink');
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
  const colorProps = {
    [`bg${color.substring(0, 1).toUpperCase()}${color.substring(1)}`]: true,
  };

  return <Color {...colorProps} bold whiteBright>{` ${title} `}</Color>;
};

const Task = ({ status, prefix, title }) => (
  <Box>
    <Status status={status} />
    <Box marginLeft={1}>
      <Color dim>{prefix}</Color>
      <Color bold>{title}</Color>
    </Box>
  </Box>
);

module.exports = React.memo(Task);
