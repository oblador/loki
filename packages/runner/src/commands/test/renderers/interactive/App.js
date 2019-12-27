const React = require('react');
const importJsx = require('import-jsx');
const { EVENT_CHANGE, EVENT_END } = require('../../task-runner');

const TaskList = importJsx('./TaskList');

const throttle = (fn, threshold = 16) => {
  let throttled = false;
  let lastCalledArguments = null;

  const executeAfterThreshold = () =>
    setTimeout(() => {
      if (lastCalledArguments) {
        fn(...lastCalledArguments);
        lastCalledArguments = null;
        executeAfterThreshold();
      } else {
        throttled = false;
      }
    }, threshold);

  return (...args) => {
    if (throttled) {
      lastCalledArguments = args;
    } else {
      throttled = true;
      executeAfterThreshold();
      fn(...args);
    }
  };
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tasks: this.props.taskRunner.getState(),
    };

    this.ended = false;

    const updateTasks = () => {
      if (!this.ended) {
        const tasks = this.props.taskRunner.getState();
        this.setState({ tasks });
      }
    };

    this.handleEnd = () => {
      updateTasks();
      this.ended = true;
    };
    this.handleChange = throttle(updateTasks, 200);
  }

  componentDidMount() {
    this.props.taskRunner.on(EVENT_END, this.handleEnd);
    this.props.taskRunner.on(EVENT_CHANGE, this.handleChange);
  }

  componentWillUnmount() {
    this.ended = true;
    this.props.taskRunner.removeListener(EVENT_END, this.handleEnd);
    this.props.taskRunner.removeListener(EVENT_CHANGE, this.handleChange);
  }

  render() {
    return <TaskList tasks={this.state.tasks} />;
  }
}

module.exports = App;
