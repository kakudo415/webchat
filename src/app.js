const wsServer = require('ws').Server;
const server = new wsServer({
  port: 8080
});
let id = 0;

server.on('connection', (ws) => {
  ws.id = id++;
  ws.on('message', (message) => {
    let data = JSON.parse(message);
    data.user = ws.id;
    let time = new Date();
    data.time = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
    server.clients.forEach((client) => {
      client.send(JSON.stringify(data));
    });
  });

  ws.on('close', () => {
    console.log('CONNECTION CLOSED');
  });
});