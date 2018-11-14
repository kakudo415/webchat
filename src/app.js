const http = require('http');
const fs = require('fs');
const wsServer = require('ws').Server;
const server = new wsServer({
  port: 50001
});
let lastID = 0;

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
  ws.userID = lastID++;

  ws.on('message', (message) => {
    const time = new Date();
    let data = {
      user: ws.userID,
      time: `${time.getFullYear()}/${time.getMonth()}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}`
    };
    try {
      let post = JSON.parse(message).message;
      data.message = post;
    } catch (err) {
      data.message = 'この人のメッセージなんか変かも！';
    }
    broadcast(data);
  });

  ws.on('close', () => {});
});

const broadcast = (msg) => {
  server.clients.forEach((client) => {
    client.send(JSON.stringify(msg), (err) => {
      if (err) {
        client.close();
      }
    });
  });
}