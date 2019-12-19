const React = require('react');
const importJsx = require('import-jsx');
const { EVENT_CHANGE } = require('../../task-runner');

const TaskList = importJsx('./TaskList');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tasks: this.props.taskRunner.getState(),
    };

    this.handleChange = () => {
      const tasks = this.props.taskRunner.getState();
      this.setState({ tasks });
    };
  }

  componentDidMount() {
    this.props.taskRunner.on(EVENT_CHANGE, this.handleChange);
  }

  componentWillUnmount() {
    this.props.taskRunner.removeListener(EVENT_CHANGE, this.handleChange);
  }

  render() {
    return <TaskList tasks={this.state.tasks} />;
  }
}

module.exports = App;
