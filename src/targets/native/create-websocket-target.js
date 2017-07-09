const debug = require('debug')('loki:websocket');
const WebSocket = require('ws');
const createMessageQueue = require('./create-message-queue');

const MESSAGE_PREFIX = 'loki:';

function createWebsocketTarget(socketUri, platform, saveScreenshotToFile) {
  let socket;
  const messageQueue = createMessageQueue();

  const send = (type, ...args) => {
    debug(`Sending message ${type} with args ${JSON.stringify(args, null, 2)}`);
    socket.send(JSON.stringify({ type, args }));
  };

  const waitForLokiMessage = type =>
    messageQueue.waitFor(
      `${MESSAGE_PREFIX}${type}`,
      data => data && data.platform === platform
    );

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

  async function start() {
    socket = await connect(socketUri);
    sendLokiCommand('hideStatusBar');
    await waitForLokiMessage('didHideStatusBar');
  }

  async function stop() {
    sendLokiCommand('restoreStatusBar');
    await waitForLokiMessage('didRestoreStatusBar');
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
    await saveScreenshotToFile(outputPath);
    debug(data);
  }

  return { start, stop, getStorybook, captureScreenshotForStory };
}

module.exports = createWebsocketTarget;
