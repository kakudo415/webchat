const http = require('http');
const fs = require('fs');
const wsServer = require('ws').Server;
const server = new wsServer({
  port: 50001
});
let id = 0;

http.createServer((req, res) => {
    fs.readFile('client.html', (err, data) => {
      if (err) {
        res.end(404);
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end(data);
      }
    });
  })
  .listen(50000);

server.on('connection', (ws) => {
  ws.id = id++;
  console.log(`ID: ${ws.id} connected`);

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