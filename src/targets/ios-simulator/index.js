const debug = require('debug')('loki:ios-simulator');
const WebSocket = require('ws');
const osnap = require('osnap/src/ios');

const MESSAGE_PREFIX = 'loki:';

const createMessageQueue = () => {
  const queue = [];

  const waitFor = type =>
    new Promise((resolve, reject) => {
      queue.push({ type, resolve, reject });
    });

  const receiveMessage = (type, args) => {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].type === type) {
        queue[i].resolve(args[0]);
        queue.splice(i, 1);
        break;
      }
    }
  };

  const rejectAll = err => {
    queue.forEach(item => item.reject(err));
    queue.splice(0, queue.length);
  };

  return { waitFor, receiveMessage, rejectAll };
};

function createIOSSimulatorTarget(socketUri) {
  let socket;
  const messageQueue = createMessageQueue();

  const send = (type, ...args) => {
    debug(`Sending message ${type} with args ${JSON.stringify(args, null, 2)}`);
    socket.send(JSON.stringify({ type, args }));
  };

  const waitForLokiMessage = type => messageQueue.waitFor(`${MESSAGE_PREFIX}${type}`);

  const sendLokiCommand = (type, ...args) => {
    send(`${MESSAGE_PREFIX}${type}`, ...args);
    return waitForLokiMessage(`did${type.substr(0, 1).toUpperCase()}${type.substr(1)}`);
  };

  const connect = uri =>
    new Promise((resolve, reject) => {
      debug(`Connecting to ${uri}`);
      const ws = new WebSocket(uri, {
        perMessageDeflate: false,
      });

      const timeout = setTimeout(() => {
        const err = new Error('Timed out connecting to storybook web socket');
        reject(err);
        messageQueue.rejectAll(err);
      }, 10000);

      const onMessage = data => {
        const { type, args } = JSON.parse(data);
        debug(
          `Received message ${type} with args ${JSON.stringify(args, null, 2)}`
        );
        messageQueue.receiveMessage(type, args);
      };

      const onError = err => {
        debug('Connection failed', err);
        clearTimeout(timeout);
        reject(err);
        messageQueue.rejectAll(err);
      };

      const onOpen = () => {
        debug('Connected');
        clearTimeout(timeout);
        // TODO: remove other listeners
        resolve(ws);
        ws.on('message', onMessage);
      };

      const onClose = () => {
        debug('Connection closed');
        clearTimeout(timeout);
      };

      ws.on('open', onOpen);
      ws.on('close', onClose);
      ws.on('error', onError);
    });

  async function start() {
    socket = await connect(socketUri);
    await sendLokiCommand('hideStatusBar');
  }

  async function stop() {
    await sendLokiCommand('restoreStatusBar');
    socket.close();
  }

  async function getStorybook() {
    send('getStories');
    const { stories } = await messageQueue.waitFor('setStories');

    return stories;
  }

  async function captureScreenshotForStory(kind, story, outputPath) {
    debug('getScreenshotForStory', kind, story);
    send('setCurrentStory', { kind, story });
    const data = await waitForLokiMessage('imagesLoaded');
    await osnap.saveToFile({ filename: outputPath });
    debug(data);
  }

  return { start, stop, getStorybook, captureScreenshotForStory };
}

module.exports = createIOSSimulatorTarget;
