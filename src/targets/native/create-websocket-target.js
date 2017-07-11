const debug = require('debug')('loki:websocket');
const WebSocket = require('ws');
const createMessageQueue = require('./create-message-queue');
const { withTimeout, withRetries } = require('../../failure-handling');

const MESSAGE_PREFIX = 'loki:';

function createWebsocketTarget(socketUri, platform, saveScreenshotToFile) {
  let socket;
  const messageQueue = createMessageQueue();

  const send = (type, ...args) => {
    debug(`Sending message ${type} with args ${JSON.stringify(args, null, 2)}`);
    socket.send(JSON.stringify({ type, args }));
  };

  const waitForLokiMessage = async (type, timeout = 2000) => {
    const prefixedType = `${MESSAGE_PREFIX}${type}`;
    const matchesPlatform = data => data && data.platform === platform;
    try {
      const message = await withTimeout(timeout)(
        messageQueue.waitFor(prefixedType, matchesPlatform)
      );
      return message;
    } catch (err) {
      messageQueue.rejectAllOfType(prefixedType);
      throw err;
    }
  };

  const sendLokiCommand = (type, params = {}) =>
    send(`${MESSAGE_PREFIX}${type}`, Object.assign({ platform }, params));

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

  const prepare = withRetries(5)(async () => {
    sendLokiCommand('prepare');
    await waitForLokiMessage('didPrepare');
  });

  async function start() {
    try {
      socket = await connect(socketUri);
    } catch (err) {
      throw new Error(
        'Failed connecting to storybook server. Start it with `yarn storybook` and review --react-native-port and --host arguments.'
      );
    }
    try {
      await prepare();
    } catch (err) {
      throw new Error(
        'Failed preparing for loki. Make sure the app is configured and running in storybook mode.'
      );
    }
  }

  async function stop() {
    sendLokiCommand('restore');
    await waitForLokiMessage('didRestore');
    socket.close();
  }

  async function getStorybook() {
    send('getStories');
    const { stories } = await messageQueue.waitFor('setStories');

    return stories;
  }

  async function captureScreenshotForStory(kind, story, outputPath) {
    debug('captureScreenshotForStory', kind, story);
    send('setCurrentStory', { kind, story });
    const data = await waitForLokiMessage('imagesLoaded', 30000);
    debug('imagesLoaded', data);
    await withTimeout(10000)(saveScreenshotToFile(outputPath));
  }

  return { start, stop, getStorybook, captureScreenshotForStory };
}

module.exports = createWebsocketTarget;
