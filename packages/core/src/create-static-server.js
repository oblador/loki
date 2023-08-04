/* eslint-disable consistent-return */
const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

async function sendFile(res, filePath) {
  const file = await fs.promises.open(filePath, 'r');
  try {
    const stat = await file.stat();
    if (!stat.isFile()) {
      const err = new Error('Path is directory');
      err.code = 'EISDIR';
      throw err;
    }
    const contentType = mime.contentType(path.basename(filePath));

    const headers = {
      'Content-Length': stat.size,
      'Cache-Control': 'no-store, must-revalidate',
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    res.writeHead(200, headers);

    const readStream = file.createReadStream({ autoClose: true });
    readStream.pipe(res, { end: true });
    readStream.on('close', () => {
      file.close();
    });
  } catch (err) {
    file.close();
    throw err;
  }
}

const createStaticServer = (dir) =>
  http.createServer(async (req, res) => {
    const url = new URL(`http://localhost${req.url}`);
    const staticFilePath = path.normalize(
      path.join(dir, url.pathname === '/' ? 'index.html' : url.pathname)
    );
    if (staticFilePath.startsWith(dir)) {
      try {
        return await sendFile(res, staticFilePath);
      } catch (err) {
        if (err.code !== 'ENOENT' && err.code !== 'EISDIR') {
          throw err;
        }
      }
    }
  });

module.exports = { createStaticServer };
