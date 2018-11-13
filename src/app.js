const wsServer = require('ws').Server;
const server = new wsServer({
  port: 8080
});

server.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('>> ' + message);
    server.clients.forEach((client) => {
      let data = JSON.parse(message);
      data.time = new Date();
      client.send(JSON.stringify(data));
    })
  });

  ws.on('close', () => {
    console.log('CLOSED');
  });
});