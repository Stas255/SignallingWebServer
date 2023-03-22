const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { deserialize, serialize, BSON } = require('bson');
const { Buffer } = require('buffer');


const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
  console.log('Connected to server');

  // Prompt user for file path
  const filePath = path.join(__dirname, 'example.txt');
  const fileStream = fs.readFileSync(filePath);
  const bufferData = Buffer.from(fileStream);

  const bsonData = serialize({  // whatever js Object you need
    file: bufferData,
    route: 'TRANSFER',
    action: 'FILE_UPLOAD',
  });
  const bytes = BSON.serialize({ action: 'FILE', data: bsonData });
  ws.send(bytes);
});

ws.on('message', function incoming(data) {
  const t = BSON.deserialize(data, { promoteBuffers: true }) // edited
  const dataFromClient = deserialize(t.data, { promoteBuffers: true }) // edited
  fs.writeFile(
    path.join('./fromanotherUser.txt'),
    dataFromClient.file, // edited
    'binary',
    (err) => {
      console.log('ERROR!!!!', err);
    }
  );
});