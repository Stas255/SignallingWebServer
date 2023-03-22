const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const { deserialize, BSON } = require('bson');
const fs = require('fs');
const path = require('path');

let webSockets = new Map();

wss.on('connection', function connection(ws) {
	
	var userID = ws._socket.remoteAddress;
  webSockets.set(userID, ws) ;
	console.log('A new client connected: ' + userID);

	ws.on('message', async (message, wsClient) => {
		try {
			console.log('GetMessage from: ' + userID);
			// сообщение пришло текстом, нужно конвертировать в JSON-формат
			const jsonMessage = BSON.deserialize(message);
			switch (jsonMessage.action) {
				case 'ECHO':
					wsClient.send(jsonMessage.data);
					break;
				case 'PING':
					setTimeout(function () {
						wsClient.send('PONG');
					}, 2000);
					break;
				case 'FILE':
					webSockets.forEach((element, key) => {
						if(key !== ws._socket.remoteAddress){
							element.send(message);
						}
					});
					break;
				default:
					console.log('Неизвестная команда');
					break;
			}
		} catch (error) {
			console.log('Ошибка', error);
		}
		// Process other business...
	});
});

